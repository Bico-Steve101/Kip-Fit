const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const axios = require('axios');
const { mpesaConfig } = require('../config');

const timestamp = moment().format('YYYYMMDDHHmmss');

const getMpesaAccessToken = async () => {
    const url = mpesaConfig.environment === 'sandbox' 
        ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' 
        : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');

    const response = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    });

    return response.data.access_token;
};

function isAuthenticated(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/login');
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        console.error('Invalid access token:', err);
        res.redirect('/login');
    }
}

class Cart {
    constructor(userId) {
        this.userId = userId;
    }

    static async getCart(userId) {
        return new Cart(userId);
    }

    async getItems() {
        const query = `
            SELECT c.product_code, c.quantity, p.title, p.price, p.image_one 
            FROM cart c 
            JOIN products p ON c.product_code = p.product_code 
            WHERE c.user_id = $1`;
        const { rows } = await pool.query(query, [this.userId]);
        return rows;
    }

    async getTotalPrice() {
        const query = `
            SELECT SUM(p.price * c.quantity) as total 
            FROM cart c 
            JOIN products p ON c.product_code = p.product_code 
            WHERE c.user_id = $1`;
        const { rows } = await pool.query(query, [this.userId]);
        const totalPrice = rows[0].total;
        return totalPrice !== null ? totalPrice : 0.00; 
    }

    async clear() {
        const query = 'DELETE FROM cart WHERE user_id = $1';
        await pool.query(query, [this.userId]);
    }

    async removeItem(productCode) {
        const query = 'DELETE FROM cart WHERE user_id = $1 AND product_code = $2';
        await pool.query(query, [this.userId, productCode]);
    }

    async updateItem(productCode, quantity) {
        const query = 'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_code = $3';
        await pool.query(query, [quantity, this.userId, productCode]);
    }
}

router.get('/checkout', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId);
        const items = await cart.getItems();
        const totalPrice = await cart.getTotalPrice();

        res.render('checkout', { items, totalPrice });
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/checkout', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId);
        const items = await cart.getItems();

        await cart.clear();
    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/update-cart/:product_code', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId);
        const productCode = req.params.product_code;
        const quantity = req.body.quantity;
        await cart.updateItem(productCode, quantity);
        const totalPrice = await cart.getTotalPrice();
        const items = await cart.getItems();
        const itemCount = items.length;
        res.render('checkout', { items, totalPrice, itemCount }, (err, html) => {
            if (err) {
                throw err;
            }
            res.json({ success: true, totalPrice, updatedCheckoutPage: html });
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false });
    }
});

router.delete('/remove-from-cart/:product_code', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId);
        const productCode = req.params.product_code;
        await cart.removeItem(productCode);
        const items = await cart.getItems();
        const itemCount = items.length;
        res.json({ success: true, itemCount });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false });
    }
});

async function getUserByTransactionId(transactionId) {
    try {
        const query = 'SELECT user_id FROM payments WHERE transaction_id = $1';
        const result = await pool.query(query, [transactionId]);
        if (result.rows.length > 0) {
            return result.rows[0].user_id;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching user by transaction ID ${transactionId}:`, error);
        return null;
    }
}
// Route to initiate M-Pesa payment
router.post('/checkout/pay', isAuthenticated, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const cart = await Cart.getCart(req.userId);
        const totalPrice = await cart.getTotalPrice();
        const amount = Number(totalPrice).toFixed(0);
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = generateMpesaPassword(timestamp);

        const mpesaAccessToken = await getMpesaAccessToken();

        const response = await initiateMpesaPayment({
            amount,
            phoneNumber,
            timestamp,
            password,
            mpesaAccessToken
        });

        if (response.data.ResponseCode === '0') {
            const transactionId = response.data.CheckoutRequestID;
            
            // Store the transaction in the database
            const query = 'INSERT INTO payments(user_id, transaction_id, payment_status) VALUES($1, $2, $3)';
            const values = [req.userId, transactionId, 'pending'];
            await pool.query(query, values);

            res.json({ success: true, transactionId });
        } else {
            res.json({ success: false, message: response.data.ErrorMessage });
        }
    } catch (error) {
        console.error('Error initiating payment request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to handle M-Pesa payment notification
router.post('/checkout/payment-notification', async (req, res) => {
    try {
        console.log('Received a payment notification');

        const callbackData = req.body;
        console.log('Callback Data:', JSON.stringify(callbackData, null, 2));
        const paymentNotification = callbackData.Body.stkCallback;
        const transactionId = paymentNotification.CheckoutRequestID;

        let paymentResult;
        if (paymentNotification.ResponseCode === '0' && paymentNotification.ResultCode === '0') {
            console.log('Payment was successful:', JSON.stringify(paymentNotification, null, 2));
            paymentResult = { success: true, status: 'completed' };
        } else {
            console.log('Payment failed:', JSON.stringify(paymentNotification, null, 2));
            paymentResult = { success: false, message: paymentNotification.ResultDesc, status: 'failed' };
        }

        // Get user ID using transaction ID
        const userId = await getUserByTransactionId(transactionId);
        if (userId) {
            const query = 'UPDATE payments SET payment_status = $1 WHERE transaction_id = $2';
            await pool.query(query, [paymentResult.status, transactionId]);
        } else {
            console.error(`No user found for transaction ID ${transactionId}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error handling payment notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/checkout/payment-status', async (req, res) => {
    const transactionId = req.query.transactionId;
    const query = 'SELECT payment_status FROM payments WHERE transaction_id = $1';
    const values = [transactionId];
    const { rows } = await pool.query(query, values);

    if (rows.length > 0) {
        res.json({ status: rows[0].payment_status });
    } else {
        res.status(404).json({ message: 'Payment status not found' });
    }
});

// Helper function to generate M-Pesa password
function generateMpesaPassword(timestamp) {
    const passwordString = mpesaConfig.lipaNaMpesaOnlineShortCode + mpesaConfig.lipaNaMpesaOnlinePasskey + timestamp;
    return Buffer.from(passwordString).toString('base64');
}

// Helper function to initiate M-Pesa payment
async function initiateMpesaPayment({ amount, phoneNumber, timestamp, password, mpesaAccessToken }) {
    const paymentRequest = {
        BusinessShortCode: mpesaConfig.lipaNaMpesaOnlineShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: mpesaConfig.lipaNaMpesaOnlineShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: 'https://9fa4-41-80-116-241.ngrok-free.app/checkout/payment-notification',
        AccountReference: 'Shop KipFit',
        TransactionDesc: 'Payment For KipFit Products'
    };

    return axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentRequest, {
        headers: {
            'Authorization': `Bearer ${mpesaAccessToken}`
        }
    });
}
router.post('/process-checkout', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId; 
        const { firstName, lastName, username, email, address, address2, country, state, zip, paymentData, items, totalPrice } = req.body;
        const paymentMethod = paymentData.paymentMethod;

        // Save the received data to the database
        const query = 'INSERT INTO orders (user_id, first_name, last_name, username, email, address, address2, country, state, zip, payment_method, payment_data, items, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)';
        const values = [userId, firstName, lastName, username, email, address, address2, country, state, zip, paymentMethod, JSON.stringify(paymentData), JSON.stringify(items), totalPrice];
        await pool.query(query, values);

        // Clear the user's cart
        const cart = await Cart.getCart(userId);
        await cart.clear();

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;

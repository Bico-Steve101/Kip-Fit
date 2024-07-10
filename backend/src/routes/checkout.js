const express = require('express')
const router = express.Router()
const { pool } = require('../config')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const axios = require('axios')
const { mpesaConfig, paypalConfig, stripeConfig } = require('../config')
const stripe = require('stripe')(stripeConfig.secretKey)
const paypal = require('@paypal/checkout-server-sdk')
const { isAuthenticated } = require('../middleware'); 

const timestamp = moment().format('YYYYMMDDHHmmss')

const getMpesaAccessToken = async () => {
    const url =
        mpesaConfig.environment === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    const auth = Buffer.from(
        `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
    ).toString('base64')

    const response = await axios.get(url, {
        headers: {
            Authorization: `Basic ${auth}`
        }
    })

    return response.data.access_token
}

class Cart {
    constructor(userId) {
        this.userId = userId
    }

    static async getCart(userId) {
        return new Cart(userId)
    }

    async getItems() {
        const query = `
            SELECT c.product_code, c.quantity, p.title, p.price, p.image_one 
            FROM cart c 
            JOIN products p ON c.product_code = p.product_code 
            WHERE c.user_id = $1`
        const { rows } = await pool.query(query, [this.userId])
        return rows
    }

    async getTotalPrice() {
        const query = `
            SELECT SUM(p.price * c.quantity) as total 
            FROM cart c 
            JOIN products p ON c.product_code = p.product_code 
            WHERE c.user_id = $1`
        const { rows } = await pool.query(query, [this.userId])
        const totalPrice = rows[0].total
        return totalPrice !== null ? totalPrice : 0.0
    }

    async clear() {
        const query = 'DELETE FROM cart WHERE user_id = $1'
        await pool.query(query, [this.userId])
    }

    async removeItem(productCode) {
        const query = 'DELETE FROM cart WHERE user_id = $1 AND product_code = $2'
        await pool.query(query, [this.userId, productCode])
    }

    async updateItem(productCode, quantity) {
        const query =
            'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_code = $3'
        await pool.query(query, [quantity, this.userId, productCode])
    }
}

router.get('/checkout', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId)
        const items = await cart.getItems()
        const totalPrice = await cart.getTotalPrice()

        res.render('checkout', { items, totalPrice })
    } catch (error) {
        console.error('Error getting cart:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/checkout', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId)
        const items = await cart.getItems()

        await cart.clear()
    } catch (error) {
        console.error('Error processing checkout:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/update-cart/:product_code', isAuthenticated, async (req, res) => {
    try {
        const cart = await Cart.getCart(req.userId)
        const productCode = req.params.product_code
        const quantity = req.body.quantity
        await cart.updateItem(productCode, quantity)
        const totalPrice = await cart.getTotalPrice()
        const items = await cart.getItems()
        const itemCount = items.length
        res.render('checkout', { items, totalPrice, itemCount }, (err, html) => {
            if (err) {
                throw err
            }
            res.json({ success: true, totalPrice, updatedCheckoutPage: html })
        })
    } catch (error) {
        console.error('Error updating cart:', error)
        res.status(500).json({ success: false })
    }
})

router.delete(
    '/remove-from-cart/:product_code',
    isAuthenticated,
    async (req, res) => {
        try {
            const cart = await Cart.getCart(req.userId)
            const productCode = req.params.product_code
            await cart.removeItem(productCode)
            const items = await cart.getItems()
            const itemCount = items.length
            res.json({ success: true, itemCount })
        } catch (error) {
            console.error('Error removing item from cart:', error)
            res.status(500).json({ success: false })
        }
    }
)

async function getUserByTransactionId(transactionId) {
    try {
        const query = 'SELECT user_id FROM payments WHERE transaction_id = $1'
        const result = await pool.query(query, [transactionId])
        if (result.rows.length > 0) {
            return result.rows[0].user_id
        } else {
            return null
        }
    } catch (error) {
        console.error(
            `Error fetching user by transaction ID ${transactionId}:`,
            error
        )
        return null
    }
}

// New function to initiate PayPal payment
async function initiatePaypalPayment(userId, paymentData, totalPrice) {
    try {
        const environment = new paypal.core.SandboxEnvironment(
            paypalConfig.clientId,
            paypalConfig.clientSecret
        );
        const client = new paypal.core.PayPalHttpClient(environment);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: Number(totalPrice).toFixed(2)
                    }
                }
            ],
            payer: {
                email_address: paymentData.paypalEmail
            }
        });

        const response = await client.execute(request);
        const transactionId = response.result.id; // Retrieve transaction ID
        await storeTransaction(userId, transactionId, 'pending', 'paypal'); // Store transaction ID
        return { success: true, transactionId }; // Return transaction ID
    } catch (error) {
        console.error('Error initiating PayPal payment:', error);
        return { success: false, message: 'Error initiating PayPal payment' };
    }
}

// New function to initiate credit card payment using Stripe
async function initiateCreditCardPayment(userId, paymentData, totalPrice) {
    try {
      // Create a PaymentIntent and attempt to confirm it immediately
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentData.stripePaymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        return_url: 'https://81bf-41-80-116-164.ngrok-free.app/checkout/payment-notification'
      });
  
      // Store transaction ID
      const transactionId = paymentIntent.id;
      await storeTransaction(userId, transactionId, 'pending', 'credit');
  
      // Return transaction ID
      return { success: true, transactionId };
    } catch (error) {
      console.error('Error initiating credit card payment:', error);
      return { success: false, message: 'Error initiating credit card payment' };
    }
  }
// Function to create a PaymentIntent
async function createPaymentIntent(userId, paymentData, totalPrice) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'usd',
        payment_method: paymentData.stripePaymentMethodId,
        confirmation_method: 'manual',
      });
  
      // Store transaction ID with 'requires_confirmation' status
      const transactionId = paymentIntent.id;
      await storeTransaction(userId, transactionId, 'requires_confirmation', 'credit');
  
      return { success: true, paymentIntentId: transactionId };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      return { success: false, message: 'Error creating PaymentIntent' };
    }
  }
  
  // Function to confirm a PaymentIntent
  async function confirmPaymentIntent(paymentIntentId, returnUrl) {
    try {
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        return_url: returnUrl,
      });
  
      // Update transaction status to 'pending' or 'confirmed' based on the result
      await updateTransactionStatus(confirmedPaymentIntent.id, 'pending');
  
      console.log('Payment confirmed:', confirmedPaymentIntent);
      return { success: true, confirmedPaymentIntent };
    } catch (error) {
      console.error('Error confirming PaymentIntent:', error);
      return { success: false, message: 'Error confirming PaymentIntent' };
    }
  }  

// New function to initiate M-Pesa payment
async function initiateMpesaPayment(userId, paymentData, totalPrice) {
    try {
        const phoneNumber = paymentData.mpesaPhoneNumber;
        const amount = Number(totalPrice).toFixed(0);
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = generateMpesaPassword(timestamp);

        const mpesaAccessToken = await getMpesaAccessToken();

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: mpesaConfig.lipaNaMpesaOnlineShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: mpesaConfig.lipaNaMpesaOnlineShortCode,
                PhoneNumber: phoneNumber,
                CallBackURL:
                    'https://81bf-41-80-116-164.ngrok-free.app/checkout/payment-notification',
                AccountReference: 'Shop KipFit',
                TransactionDesc: 'Payment For KipFit Products'
            },
            {
                headers: {
                    Authorization: `Bearer ${mpesaAccessToken}`
                }
            }
        );

        if (response.data.ResponseCode === '0') {
            const transactionId = response.data.CheckoutRequestID; // Retrieve transaction ID
            await storeTransaction(userId, transactionId, 'pending', 'M-pesa'); // Store transaction ID
            return { success: true, transactionId }; // Return transaction ID
        } else {
            return { success: false, message: response.data.ErrorMessage };
        }
    } catch (error) {
        console.error('Error initiating M-Pesa payment:', error);
        return { success: false, message: 'Error initiating M-Pesa payment' };
    }
}


// Route to initiate payment based on the selected method
router.post('/checkout/pay', isAuthenticated, async (req, res) => {
    try {
        const { paymentMethod, paymentData, totalPrice } = req.body;
        let result;

        switch (paymentMethod) {
            case 'M-pesa':
                result = await initiateMpesaPayment(req.userId, paymentData, totalPrice);
                break;
            case 'paypal':
                result = await initiatePaypalPayment(req.userId, paymentData, totalPrice);
                break;
            case 'credit':
                result = await initiateCreditCardPayment(req.userId, paymentData, totalPrice);
                break;
            default:
                throw new Error('Invalid payment method');
        }

        if (result.success) {
            res.json({ success: true, transactionId: result.transactionId });
        } else {
            res.json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error initiating payment request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


async function storeTransaction(userId, transactionId, status, paymentMethod) {
    const query = `
        INSERT INTO payments(user_id, transaction_id, payment_status, payment_method) 
        VALUES($1, $2, $3, $4)
    `;
    const values = [userId, transactionId, status, paymentMethod];
    await pool.query(query, values);
}


// Route for receiving payment notifications
router.post('/checkout/payment-notification', async (req, res) => {
    try {
        console.log('Received a payment notification');

        const callbackData = req.body;
        console.log('Callback Data:', JSON.stringify(callbackData, null, 2));
        let paymentResult;
        let transactionId;

        // Determine the payment method and transaction ID from the callback data
        if (callbackData.Body && callbackData.Body.stkCallback) {
            // M-Pesa callback data structure
            transactionId = callbackData.Body.stkCallback.CheckoutRequestID;
        } else if (callbackData.event_type === "PAYMENT.SALE.COMPLETED" && callbackData.resource && callbackData.resource.id) {
            // PayPal callback data structure
            transactionId = callbackData.resource.id;
            paymentResult = { success: true, status: 'completed' };
        } else if (callbackData.data && callbackData.data.object && callbackData.data.object.type === 'payment_intent') {
            // Stripe callback data structure
            transactionId = callbackData.data.object.id;
        }

        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID not found in callback data' });
        }

        // Fetch the user and payment method associated with the transaction ID
        const userQuery = 'SELECT user_id, payment_method FROM payments WHERE transaction_id = $1';
        const { rows } = await pool.query(userQuery, [transactionId]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        const { user_id: userId, payment_method: paymentMethod } = rows[0];

        if (paymentMethod === 'M-pesa') {
            // Handle M-pesa payment callback data
            const paymentNotification = callbackData.Body.stkCallback;

            if (
                paymentNotification.ResponseCode === '0' &&
                paymentNotification.ResultCode === '0'
            ) {
                console.log(
                    'M-pesa payment was successful:',
                    JSON.stringify(paymentNotification, null, 2)
                );
                paymentResult = { success: true, status: 'completed' };
            } else {
                console.log(
                    'M-pesa payment failed:',
                    JSON.stringify(paymentNotification, null, 2)
                );
                paymentResult = {
                    success: false,
                    message: paymentNotification.ResultDesc,
                    status: 'failed'
                };
            }
        } else if (paymentMethod === 'paypal') {
            // Handle PayPal payment callback data
            if (callbackData.resource && callbackData.resource.state === 'completed') {
                console.log(
                    'PayPal payment was successful:',
                    JSON.stringify(callbackData, null, 2)
                );
                paymentResult = { success: true, status: 'completed' };
            } else {
                console.log(
                    'PayPal payment failed:',
                    JSON.stringify(callbackData, null, 2)
                );
                paymentResult = {
                    success: false,
                    message: 'PayPal payment failed',
                    status: 'failed'
                };
            }
        } else if (paymentMethod === 'credit') {
            // Handle credit card payment callback data
            if (callbackData.status === 'succeeded') {
                console.log(
                    'Credit card payment was successful:',
                    JSON.stringify(callbackData, null, 2)
                );
                paymentResult = { success: true, status: 'completed' };
            } else {
                console.log(
                    'Credit card payment failed:',
                    JSON.stringify(callbackData, null, 2)
                );
                paymentResult = {
                    success: false,
                    message: 'Credit card payment failed',
                    status: 'failed'
                };
            }
        } else {
            console.error('Invalid payment method');
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Update payment status in the database
        const query = 'UPDATE payments SET payment_status = $1 WHERE transaction_id = $2';
        await pool.query(query, [paymentResult.status, transactionId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error handling payment notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route for receiving PayPal webhook events
router.post('/webhooks/paypal', async (req, res) => {
    const { headers, body } = req;
    const signature = headers['paypal-auth-algo'] + '=' + headers['paypal-auth-sig'];

    try {
        await paypal.webhooks().validateWebhookSignature(signature, body);
        const webhookEvent = body;
        // Handle PayPal webhook event, update payment status in database, etc.
        res.status(200).send('Webhook received successfully.');
    } catch (error) {
        console.error('Error validating PayPal webhook:', error);
        res.status(400).send('Invalid PayPal webhook signature.');
    }
});

// Route for receiving Stripe webhook events
router.post('/webhooks/stripe', async (req, res) => {
    const event = req.body;

    try {
        // Handle Stripe webhook event, update payment status in database, etc.
        res.status(200).send('Webhook received successfully.');
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        res.status(400).send('Error handling Stripe webhook.');
    }
});

// Route for querying payment status
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

function generateMpesaPassword(timestamp) {
    const passwordString =
        mpesaConfig.lipaNaMpesaOnlineShortCode +
        mpesaConfig.lipaNaMpesaOnlinePasskey +
        timestamp
    return Buffer.from(passwordString).toString('base64')
}

router.post('/process-checkout', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId
        const {
            firstName,
            lastName,
            username,
            email,
            address,
            address2,
            country,
            state,
            zip,
            paymentData,
            items,
            totalPrice
        } = req.body
        const paymentMethod = paymentData.paymentMethod

        const query =
            'INSERT INTO orders (user_id, first_name, last_name, username, email, address, address2, country, state, zip, payment_method, payment_data, items, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)'
        const values = [
            userId,
            firstName,
            lastName,
            username,
            email,
            address,
            address2,
            country,
            state,
            zip,
            paymentMethod,
            JSON.stringify(paymentData),
            JSON.stringify(items),
            totalPrice
        ]
        await pool.query(query, values)

        const cart = await Cart.getCart(userId)
        await cart.clear()

        res.json({ success: true })
    } catch (error) {
        console.error('Error processing checkout:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

module.exports = router

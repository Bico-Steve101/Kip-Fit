const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const { isAuthenticated } = require('../middleware');
const axios = require('axios');
const QRCode = require('qrcode');

class Orders {
    constructor(userId) {
        this.userId = userId;
    }

    static async getOrders(userId) {
        return new Orders(userId);
    }

    async getInvoices() {
        const query = `
            SELECT * 
            FROM orders
            WHERE user_id = $1 AND status = 'Completed'
            ORDER BY created_at DESC`;
        const { rows } = await pool.query(query, [this.userId]);
        return rows;
    }
}

// Function to fetch current exchange rate
async function fetchExchangeRate() {
    try {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/febc9c17e1e220cd07b8b18b/latest/USD');
        return response.data.conversion_rates.KES;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return null;
    }
}

// Function to generate QR code
async function generateQRCode(text) {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(text);
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
}

// Route to render the invoice page
router.get('/invoice', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        const userOrders = await Orders.getOrders(userId);
        const completedOrders = await userOrders.getInvoices();

        if (completedOrders.length === 0) {
            console.log('No completed orders found for user:', userId);
        } else {
            console.log('Completed orders found:', completedOrders);
        }

        const userDetails = completedOrders.length > 0 ? {
            first_name: completedOrders[0].first_name,
            last_name: completedOrders[0].last_name,
            address: completedOrders[0].address,
            address2: completedOrders[0].address2,
            country: completedOrders[0].country,
            state: completedOrders[0].state,
            zip: completedOrders[0].zip,
            email: completedOrders[0].email
        } : {};

        completedOrders.forEach(order => {
            if (typeof order.items === 'string') {
                try {
                    order.items = JSON.parse(order.items);
                } catch (err) {
                    console.error('Error parsing order items:', order.items, err);
                }
            }
            order.items.forEach(item => {
                item.total = parseFloat(item.price) * item.quantity;
            });
        });

        let subtotal = completedOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => {
                return itemSum + item.total;
            }, 0);
        }, 0);

        const discount = subtotal * 0.2;
        const vat = (subtotal - discount) * 0.1;
        const total = subtotal - discount + vat;
        const exchangeRate = await fetchExchangeRate();
        const usdTotal = total / exchangeRate;

        // Generate QR code with the invoice URL
        const invoiceUrl = `https://yourwebsite.com/invoice/${userId}`;
        const qrCodeDataUrl = await generateQRCode(invoiceUrl);

        res.render('invoice', {
            userDetails: userDetails,
            completedOrders: completedOrders,
            subtotal: subtotal.toFixed(2),
            discount: discount.toFixed(2),
            vat: vat.toFixed(2),
            total: total.toFixed(2),
            usdTotal: usdTotal.toFixed(2),
            exchangeRate: exchangeRate,
            qrCodeDataUrl: qrCodeDataUrl,
            currentDate: new Date().toISOString().slice(0, 10)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

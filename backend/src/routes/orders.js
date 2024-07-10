const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const jwt = require('jsonwebtoken');

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

// Route for rendering orders page
router.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const query = 'SELECT * FROM orders WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        res.render('orders', { orders: rows });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route for updating order status
router.put('/orders/:orderId/status', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.orderId;
        const { status } = req.body;
        const query = 'UPDATE orders SET status = $1 WHERE order_id = $2 AND user_id = $3 RETURNING *';
        const { rows } = await pool.query(query, [status, orderId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order: rows[0] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route for deleting an order
router.delete('/orders/:orderId', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.orderId;
        const query = 'DELETE FROM orders WHERE order_id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [orderId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

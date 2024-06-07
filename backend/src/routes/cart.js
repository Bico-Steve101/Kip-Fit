// Import the necessary modules
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config'); // Assuming you have a pool configured for PostgreSQL

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({ message: 'Please log in or sign up to add items to the cart' });
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ message: 'Please log in or sign up to add items to the cart' });
    }
}

// Route to add a product to the cart
router.post('/add-to-cart', isAuthenticated, async (req, res) => {
    let { productCode, quantity, size } = req.body;

    // Set default values if not provided
    quantity = quantity || 1;
    size = size || 'XS';

    try {
        // Check if the product exists
        const productResult = await pool.query('SELECT * FROM products WHERE product_code  = $1', [productCode]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add the product to the user's cart
        const query = `
            INSERT INTO cart (user_id, product_code, quantity, size)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, product_code)
            DO UPDATE SET quantity = cart.quantity + $3, size = $4
            RETURNING *;
        `;
        const values = [req.userId, productCode, quantity, size];
        const result = await pool.query(query, values);

        res.status(200).json({ message: 'Product added to cart', cartItem: result.rows[0] });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
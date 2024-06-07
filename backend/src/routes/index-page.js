const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const { pool } = require('../config');

// Initialize cache with a TTL (time to live) of 60 seconds for users and 300 seconds for products
const userCache = new NodeCache({ stdTTL: 60 });
const productCache = new NodeCache({ stdTTL: 300 });

// Function to retrieve user information from the database based on user ID
async function getUserInfo(userId) {
    const cacheKey = `user_${userId}`;
    let userInfo = userCache.get(cacheKey);

    if (!userInfo) {
        try {
            const query = 'SELECT username, first_name, last_name FROM users WHERE id = $1';
            // Make the database query asynchronous
            const { rows } = await pool.query(query, [userId]);
            userInfo = rows[0] || null;
            if (userInfo) {
                userCache.set(cacheKey, userInfo);
            }
        } catch (error) {
            console.error(`Error fetching user info for user ID ${userId}:`, error);
            return null;
        }
    }

    return userInfo;
}

// Function to retrieve products from the database
async function getProducts(startIndex, batchSize) {
    const cacheKey = 'products';
    let products = productCache.get(cacheKey);

    if (!products) {
        try {
            const query = 'SELECT * FROM products';
            // Make the database query asynchronous
            const { rows } = await pool.query(query);
            products = rows.map(product => {
                // Convert images to Base64 format
                if (product.image_one) {
                    product.image_one = `data:image/jpeg;base64,${Buffer.from(product.image_one).toString('base64')}`;
                }
                return product;
            });
            // Store products in cache
            productCache.set(cacheKey, products);
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    return products;
}

// Render the index page
router.get('/', async (req, res) => {
    let username = 'Guest';
    let firstName = '';
    let lastName = '';
    let userId;

    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
            userId = decodedToken.userId;
        }

        // Fetching user information from cache or database
        const userInfo = await getUserInfo(userId);

        // Fetching products from cache or database
        const products = await getProducts();

        if (userInfo) {
            username = userInfo.username;
            firstName = userInfo.first_name;
            lastName = userInfo.last_name;
        }

        res.render('index', { username, firstName, lastName, products });
    } catch (err) {
        console.error('An error occurred while rendering the index page:', err);
        res.status(500).render('index', { username, firstName, lastName, products: [] });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');
const { pool } = require('../config');

// Initialize cache with a TTL (time to live) of 300 seconds for products
const productCache = new NodeCache({ stdTTL: 300 });

async function getProducts() {
    const cacheKey = 'products';
    let products = productCache.get(cacheKey);

    if (!products) {
        try {
            const query = 'SELECT * FROM products';
            const { rows } = await pool.query(query);
            products = rows.map(product => {
                if (product.image_one) {
                    const imageBase64 = Buffer.from(product.image_one).toString('base64');
                    product.image_one = `data:image/jpeg;base64,${imageBase64}`;
                }
                return product;
            });
            productCache.set(cacheKey, products);
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    return products;
}

async function getUserInfo(userId) {
    if (!userId) return null;

    const query = 'SELECT * FROM users WHERE id = $1';
    try {
        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        return null;
    }
}

// Render the shop page
router.get('/shop', async (req, res) => {
    let username = 'Guest';
    let firstName = '';
    let lastName = '';
    let userId;
    let userInfo = null;

    try {
        const accessToken = req.cookies.accessToken;
        if (accessToken) {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
            userId = decodedToken.userId;
            userInfo = await getUserInfo(userId);
        }

        const products = await getProducts();
        const authenticated = !!userInfo;

        if (userInfo) {
            username = userInfo.username;
            firstName = userInfo.first_name;
            lastName = userInfo.last_name;
        }

        res.render('shop', {
            username,
            firstName,
            lastName,
            authenticated,
            products
        });
    } catch (err) {
        console.error('An error occurred while rendering the shop page:', err);
        res.status(500).render('shop', {
            username,
            firstName,
            lastName,
            authenticated: false,
            products: [],
        });
    }
});

module.exports = router;

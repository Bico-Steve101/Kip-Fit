const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config'); 
const NodeCache = require('node-cache');

const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Function to retrieve a product by its UUID
async function getProductByUUID(uuid) {
    try {
        const client = await pool.connect(); // Connect to the database

        // First, try to retrieve the product from the cache
        const cachedProduct = myCache.get(uuid);
        if (cachedProduct) {
            console.log('Retrieved from cache');
            client.release(); // Release the client after using it
            return cachedProduct;
        }

        const query = 'SELECT * FROM products WHERE uuid = $1';
        const result = await client.query(query, [uuid]); // Execute the query

        if (result.rows.length > 0) {
            const product = result.rows[0];
            // Convert image fields to base64 strings and cache them
            const imageFields = ['image_one', 'image_two', 'image_three', 'image_four', 'image_five'];
            imageFields.forEach(field => {
                if (product[field]) {
                    // Check if the image is already cached
                    const cachedImage = myCache.get(`${uuid}_${field}`);
                    if (cachedImage) {
                        product[field] = cachedImage;
                    } else {
                        const base64Image = `data:image/jpeg;base64,${Buffer.from(product[field]).toString('base64')}`;
                        product[field] = base64Image;
                        // Cache the base64 image string
                        myCache.set(`${uuid}_${field}`, base64Image);
                    }
                }
            });
            // Cache the product before returning it
            myCache.set(uuid, product);
            console.log('Added to cache');
            client.release(); // Release the client after using it
            return product;
        } else {
            client.release(); // Release the client after using it
            return null;
        }
    } catch (error) {
        console.error(`Error fetching product with UUID ${uuid}:`, error);
        return null;
    }
}

// Render the product details page
router.get('/product-detail/:uuid', async (req, res) => {
    let username = 'Guest'; // Default username
    let firstName = '';
    let lastName = '';

    // Fetching user information concurrently
    const userInfo = req.userInfo;

    // Update user info if fetched successfully
    if (userInfo) {
        username = userInfo.username;
        firstName = userInfo.first_name;
        lastName = userInfo.last_name;
    }

    // Fetching product details based on UUID
    const uuid = req.params.uuid;
    const product = await getProductByUUID(uuid);

    // Render the product details page with user info and product details
    res.render('product-detail', { username, firstName, lastName, product });
});

module.exports = router;

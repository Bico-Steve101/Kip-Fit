// login.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config');
router.post('/', async (req, res) => {
    try {
        const client = await pool.connect(); // Getting the database connection
        
        const { email, password, remember } = req.body; 

        // Checking if the user exists
        const userCheckResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userCheckResult.rows[0];
        if (!user) {
            client.release();
            return res.redirect('/login?message=User does not exist&type=error');
        }

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            client.release();
            return res.redirect('/login?message=Incorrect password&type=error');
        }

        // Generating Access Token
        let accessTokenExpiration = '15m'; 
        if (remember) {
            accessTokenExpiration = '30d'; 
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: accessTokenExpiration });

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000 });

        // Release the client
        client.release();

        // Redirecting with success message
        const redirectUrl = req.session.redirectUrl || req.body.redirectUrl || '/';
        delete req.session.redirectUrl;
        res.redirect(`${redirectUrl}?message=Login successful. Redirecting...&type=success`);
    } catch (err) {
        console.error('Error during login:', err);
        res.redirect('/login?message=Server error&type=error');
    }
});

module.exports = router;

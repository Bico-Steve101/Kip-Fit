// register.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config');

router.post('/', async (req, res) => {
    try {
        const client = await pool.connect(); 
        
        const { firstName, lastName, username, email, password } = req.body;

        // Checking if the user already exists
        const userCheckResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheckResult.rows.length > 0) {
            client.release();
            return res.redirect('/register?message=User already exists&type=error');
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserting the new user into the database
        const insertUserResult = await client.query(
            'INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [firstName, lastName, username, email, hashedPassword]
        );

        const user = insertUserResult.rows[0];

        // Generating Access Token
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true });

        // Release the client
        client.release();

        // Redirecting with success message
        res.redirect('/register?message=You have been registered successfully. Redirecting...&type=success&redirect=/');
    } catch (err) {
        console.error('Error during registration:', err);
        res.redirect('/register?message=Server error&type=error');
    }
});


module.exports = router;

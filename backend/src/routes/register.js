require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config'); // Using the pool directly

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, _csrf } = req.body;

        // CSRF token validation
        if (_csrf !== req.csrfToken()) {
            return res.status(403).json({ message: 'Invalid CSRF token' });
        }

        // Checking if the user already exists
        const userCheckResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserting the new user into the database
        const insertUserResult = await pool.query(
            'INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [firstName, lastName, username, email, hashedPassword]
        );

        const user = insertUserResult.rows[0];

        // Generating Access Token
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true });

        // Responding with success message
        res.status(200).json({ message: 'You have been registered successfully. Redirecting...', redirect: '/' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

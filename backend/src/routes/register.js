require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config');

// Multer for file upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('avatar'), async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        // Handle avatar data
        const avatarData = req.file ? req.file.buffer : null;

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserting the new user into the database
        const insertUserResult = await pool.query(
            'INSERT INTO users (first_name, last_name, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [firstName, lastName, username, email, hashedPassword, avatarData]
        );

        const user = insertUserResult.rows[0];

        // Generating Access Token
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true });

        // Redirecting with success message
        res.redirect('/register?message=You have been registered successfully. Redirecting...&type=success&redirect=/');
    } catch (err) {
        console.error('Error during registration:', err);
        res.redirect('/register?message=Server error&type=error');
    }
});

module.exports = router;

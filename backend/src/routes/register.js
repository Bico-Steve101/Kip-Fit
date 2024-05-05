const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config'); 

router.post('/register', async (req, res) => {
    try {
        const db = await getDb(); 
        
        const { username, email, password } = req.body;

        // Checking if the user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.redirect('/register?message=User already exists&type=error');
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserting the new user into the database
        await db.collection('users').insertOne({ username, email, password: hashedPassword });

        // Generating Access Token
        const user = await db.collection('users').findOne({ email }); 
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Generating Refresh Token
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_TOKEN);

        // Storing Refresh Token in Database

        // Setting Tokens in Cookies
        res.cookie('accessToken', accessToken, { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true });

        // Redirecting with success message
        res.redirect('/register?message=You have been registered successfully. Redirecting...&type=success');
    } catch (err) {
        console.error(err);
        res.redirect('/register?message=Server error&type=error');
    }
});

module.exports = router;

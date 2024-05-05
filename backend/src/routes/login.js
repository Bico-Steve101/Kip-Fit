const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config'); 

router.post('/login', async (req, res) => {
    try {
        const db = await getDb(); // Getting the database connection
        
        const { email, password, remember } = req.body; 

        // Checking if the user exists
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.redirect('/login?message=User does not exist&type=error');
        }

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.redirect('/login?message=Incorrect password&type=error');
        }

        // Generating Access Token
        let accessTokenExpiration = '15m'; 
        if (remember) {
            accessTokenExpiration = '30d'; 
        }
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenExpiration });

        // Generating Refresh Token
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET);

        // Storing Refresh Token in Database or Cookie 
        if (remember) {
            // Storing refresh token in a persistent storage (30days expiry)
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); 
        }

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true });

        // Redirecting with success message
        res.redirect('/?message=Login successful. Redirecting...&type=success');
    } catch (err) {
        console.error(err);
        res.redirect('/?message=Server error&type=error');
    }
});

module.exports = router;

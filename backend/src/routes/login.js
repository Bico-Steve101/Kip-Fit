require('dotenv').config();
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
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
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
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: accessTokenExpiration });
        
        console.log('JWT_SECRET:', process.env.JWT_SECRET);

        // Setting Access Token in Cookie
        res.cookie('accessToken', accessToken, { httpOnly: true });

        // Redirecting with success message
        res.redirect('/?message=Login successful. Redirecting...&type=success');
    } catch (err) {
        console.error('Error during login:', err);
        res.redirect('/login?message=Server error&type=error');
    }
});

module.exports = router;

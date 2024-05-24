const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/users'); 

router.get('/lock-screen', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-lock-screen.html'));
});

router.post('/unlock-screen', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Fetch user by email
        const user = await User.findOne({ email });

        // Check if user exists and password is correct
        if (user && await user.comparePassword(password)) {
            res.send('Account unlocked successfully!');
        } else {
            res.status(401).send('Incorrect email or password. Account could not be unlocked.');
        }
    } catch (error) {
        console.error('Error unlocking account:', error);
        res.status(500).send('An error occurred while unlocking the account.');
    }
});

module.exports = router;

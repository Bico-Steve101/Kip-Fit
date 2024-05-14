const express = require('express');
const router = express.Router();
const { getDb } = require('../config');

// Route to view user profile
router.get('/profile', async (req, res) => {
    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    const userId = req.user.userId; 

    try {
        const db = await getDb();
        const user = await db.collection('users').findOne({ _id: userId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the profile.ejs template with the user's email and username
        res.render('profile', { email: user.email, username: user.username });
    } catch (err) {
        console.error('Error retrieving user data:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

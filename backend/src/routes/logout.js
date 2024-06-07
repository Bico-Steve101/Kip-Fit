const express = require('express');
const router = express.Router();

// Logout route
router.get('/', (req, res) => {
    try {
        // Clear the access token cookie
        res.clearCookie('accessToken');

        // Redirect the user to the login
        res.redirect('/login');
    } catch (error) {
        console.error('Error during logout:', error);
        res.redirect('/'); 
    }
});

module.exports = router;

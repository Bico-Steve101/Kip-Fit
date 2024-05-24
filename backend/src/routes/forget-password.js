const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const MongoDB = require('../config'); 

// Set the view engine to use EJS
router.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-forgot-password.html'));
});

// Route to handle the forgot password form submission
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the users collection
    const user = await MongoDB.model('User').findOne({ email });

    if (!user) {
      // User not found
      return res.render('forgot-password', { error: 'Email not found' });
    }

    // Generate a new password
    const newPassword = generateNewPassword();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await MongoDB.model('User').updateOne(
      { email: user.email },
      { $set: { password: hashedPassword } }
    );


    res.render('forgot-password', { success: 'Your password has been reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).render('forgot-password', { error: 'An error occurred while resetting your password' });
  }
});

// Helper function to generate a new password
function generateNewPassword() {
  
  return 'newPassword123'; 
}

module.exports = router;
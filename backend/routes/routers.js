const express = require('express');
const router = express.Router();

router.get('/pricing.ejs', (req, res) => {
    res.render("pricing.ejs");
});
router.get('/checkout.ejs', (req, res) => {
    res.render("checkout.ejs");
});

module.exports = router;
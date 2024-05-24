const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Route to get product details by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error getting product details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle adding product reviews
router.post('/:id/reviews', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating and comment are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const reviewAdded = await product.addReview(rating, comment);
        if (!reviewAdded) {
            return res.status(500).json({ error: 'Failed to add review' });
        }

        res.json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

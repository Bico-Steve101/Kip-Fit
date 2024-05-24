const express = require('express');
const router = express.Router();
const client = require('../config');

// Sample data - replace with your database interactions
const products = [
    {
        id: 1,
        name: 'Gym Equipments',
        price: 13499,
        availability: true,
        description: 'Lorem Ipsum...',
        images: ['/images/p1.jpg', '/images/p2.jpg', '/images/p3.jpg']
        // Add more product details as needed
    },
    // Add more products as needed
];

// Route to get product details by ID
router.get('/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(product => product.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
});

// Route to handle adding product reviews
router.post('/:id/reviews', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating and comment are required' });
        }

        // Get the MongoDB database instance from the client
        const db = client.db('your_database_name'); // Replace 'your_database_name' with your actual database name

        const product = await db.collection('products').findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Add review to the product
        await db.collection('products').updateOne(
            { id: productId },
            { $push: { reviews: { rating, comment } } }
        );

        res.json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
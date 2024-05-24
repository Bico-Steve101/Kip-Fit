const express = require('express');
const router = express.Router();
const FoodMenuModel = require('../models/food-menu');

router.post('/addMenu', async (req, res) => {
    try {
        const { name, description, ingredients, time } = req.body;

        const result = await FoodMenuModel.addMenu(name, description, ingredients, time);

        // Send success response
        res.status(201).send(result);
    } catch (error) {
        console.error('Error adding menu:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../config');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to display the form
router.get('/add_product', (req, res) => {
  res.render('add_product');
});

// Route to handle form submission
router.post('/add_product', upload.fields([
  { name: 'image_one' }, 
  { name: 'image_two' }, 
  { name: 'image_three' }, 
  { name: 'image_four' }, 
  { name: 'image_five' }
]), async (req, res) => {
  try {
    const { title, price, reviews, star_rating, size, quantity, brand, availability, tags } = req.body;
    const tagArray = tags ? tags.split(',') : [];

    const images = {
      image_one: req.files['image_one'] ? req.files['image_one'][0].buffer.toString('base64') : null,
      image_two: req.files['image_two'] ? req.files['image_two'][0].buffer.toString('base64') : null,
      image_three: req.files['image_three'] ? req.files['image_three'][0].buffer.toString('base64') : null,
      image_four: req.files['image_four'] ? req.files['image_four'][0].buffer.toString('base64') : null,
      image_five: req.files['image_five'] ? req.files['image_five'][0].buffer.toString('base64') : null,
    };

    const query = `
      INSERT INTO products (title, image_one, image_two, image_three, image_four, image_five, reviews, star_rating, price, availability, brand, tags, size, quantity)
      VALUES ($1, decode($2, 'base64'), decode($3, 'base64'), decode($4, 'base64'), decode($5, 'base64'), decode($6, 'base64'), $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    const values = [
      title,
      images.image_one,
      images.image_two,
      images.image_three,
      images.image_four,
      images.image_five,
      reviews,
      star_rating,
      price,
      availability === 'on',
      brand,
      tagArray,
      size,
      quantity,
    ];

    const client = await pool();
    await client.query(query, values);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

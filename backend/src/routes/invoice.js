const express = require('express');
const router = express.Router();
const { getDb } = require('../config'); // Adjust the path to match the location of config.js
const path = require('path');

// Define the Invoice schema
const invoiceSchema = {
  customerName: String,
  customerAddress: String,
  items: [
    {
      item: String,
      description: String,
      unitCost: Number,
      quantity: Number,
      total: Number,
    }
  ],
  subtotal: Number,
  discount: Number,
  vat: Number,
  total: Number,
};

// Route to render the invoice page
router.get('/invoice', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-invoice.html'));
});

// Route to save the invoice data
router.post('/save', async (req, res) => {
  try {
    const db = await getDb(); // Get the MongoDB database instance from the config
    const invoicesCollection = db.collection('invoices');
    const {
      customerName,
      customerAddress,
      items,
      subtotal,
      discount,
      vat,
      total,
    } = req.body;

    const newInvoice = {
      customerName,
      customerAddress,
      items,
      subtotal,
      discount,
      vat,
      total,
    };

    const result = await invoicesCollection.insertOne(newInvoice);
    console.log(`Invoice ${result.insertedId} has been saved successfully.`);
    res.json({ message: 'Invoice saved successfully' });
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({ error: 'An error occurred while saving the invoice' });
  }
});

module.exports = router;

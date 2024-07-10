require('dotenv').config();
const { Pool } = require('pg');
const paypal = require('@paypal/checkout-server-sdk');


// PostgreSQL database connection details
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST || 'localhost',
  database: 'KipFit',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

// M-Pesa API credentials and configurations
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT,
  lipaNaMpesaOnlineShortCode: process.env.MPESA_SHORTCODE,
  lipaNaMpesaOnlinePasskey: process.env.MPESA_PASSKEY,
};

// PayPal API configurations
const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  environment: process.env.PAYPAL_ENVIRONMENT,
};

// Stripe API configurations
const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
};

// Export all configurations
module.exports = { pool, mpesaConfig, paypalConfig, stripeConfig };

require('dotenv').config();
const { Pool } = require('pg');

// Connection details
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
  environment: process.env.MPESA_ENVIRONMENT, // 'sandbox' or 'production'
  lipaNaMpesaOnlineShortCode: process.env.MPESA_SHORTCODE,
  lipaNaMpesaOnlinePasskey: process.env.MPESA_PASSKEY,
};


// Export the pool and M-Pesa config
module.exports = { pool, mpesaConfig };

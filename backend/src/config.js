require('dotenv').config();
const { Pool } = require('pg');

// Connection details
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST || 'localhost', // Default to localhost if not provided
  database: 'KipFit',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Default to 5432 if not provided
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

// Export the pool
module.exports = pool;

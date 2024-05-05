require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const username = encodeURIComponent(process.env.DB_USERNAME);
const password = encodeURIComponent(process.env.DB_PASSWORD);
const clusterUrl = 'kipfit.wi5fflx.mongodb.net';
const authMechanism = 'DEFAULT';

const url = `mongodb+srv://${username}:${password}@${clusterUrl}/?authMechanism=${authMechanism}`;

// Database Name
const dbName = 'KipFit';

// Create a new MongoClient
const client = new MongoClient(url);

let db;

// Use connect method to connect to the server
async function connect() {
  await client.connect();
  console.log("Connected successfully to server");
  db = client.db(dbName);
}

connect();

function getDb() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    } else {
      client.connect(err => {
        if (err) {
          reject('Failed to connect to the MongoDB server. Error:', err);
        } else {
          console.log("Connected successfully to server");
          db = client.db(dbName);
          resolve(db);
        }
      });
    }
  });
}

module.exports = { getDb };
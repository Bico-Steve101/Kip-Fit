require('dotenv').config();
//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ServerApiVersion } = require('mongodb');


// Connection URL
//const username = encodeURIComponent(process.env.DB_USERNAME);
//const password = encodeURIComponent(process.env.DB_PASSWORD);
//const clusterUrl = 'kipfit.wi5fflx.mongodb.net';
//const authMechanism = 'DEFAULT';

//const url = `mongodb+srv://${username}:${password}@${clusterUrl}/?authMechanism=${authMechanism}`;
const uri = "mongodb+srv://tEDK2aeOBsDAgei7>@cluster0.sjc1pul.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Database Name
const dbName = 'KIPFIT';

// Create a new MongoClient
// 

//const client = new MongoClient(url);
 const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Use connect method to connect to the server
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
//connect();

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
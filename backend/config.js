const mongoose = require('mongoose');

// MongoDB Atlas connection URI
const connect = mongoose.connect("mongodb://atlas-sql-6636abcbb5cffe729d9ece2a-zgl9e.a.query.mongodb.net/Kip-Fit?ssl=true&authSource=admin")
// Connect to MongoDB Atlas
connect.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch(() => {
    console.log('Failed to connect to MongoDB Atlas');
});


//The schemas
const LoginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//collection Models
const collection = mongoose.model('Kip-Fit', LoginSchema);

module.exports = collection;

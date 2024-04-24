const express = require('express');
const cors = require('cors');
const videoRoutes = require('./routes/videoRoutes');
const productRoutes = require('./routes/productRoutes');


const app = express();


const mongoose = require('mongoose');

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/gymDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
// })
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.log(err));

// Import routes
const userRoutes = require('./routes/userRoutes');
// const videoRoutes = require('./routes/videoRoutes');
// const productRoutes = require('./routes/productRoutes');

// Use routes
// app.use('/api/users', userRoutes);
// app.use('/api/videos', videoRoutes);
// app.use('/api/products', productRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Gym Backend is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

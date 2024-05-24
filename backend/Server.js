const express = require('express');
const cors = require('cors');
const path = require('path'); 
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());  

// Serve static files
app.use(express.static('static'));

// Import routes
const loginRoutes = require('./src/routes/login');
const registerRoutes = require('./src/routes/register');
const profileRoutes = require('./src/routes/profile');
const invoiceRoutes = require('./src/routes/invoice');
const calendarRoutes = require ('./src/routes/calendar');
const forgotPasswordRoutes = require ('./src/routes/forget-password');
const lockScreenRoutes = require ('./src/routes/lock-screen');
const foodMenuRoutes = require ('./src/routes/food-menu')


// Serve static files for pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/index.html'));
});


app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/app-calender.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/app-profile.html'));
});
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-checkout.html'));
});
app.get('/customer', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-customer.html'));
});
app.get('/invoice', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-invoice.html'));
});
app.get('/product-detail', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-product-detail.html'));
});
app.get('/product-grid', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-product-grid.html'));
});
app.get('/product-order', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-product-order.html'));
});
app.get('/food-menu', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/food-menu.html'));
});
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-forgot-password.html'));
});
app.get('/lock-screen', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-lock-screen.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/page-register.html'));
});
app.get('/personal-record', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/personal-record.html'));
});
app.get('/add-item', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/add-item.html'));
});
app.get('/admin-catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/catalog.html'));
});
app.get('/admin-comments', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/comments.html'));
});
app.get('/edit-user', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/edit-user.html'));
});
app.get('/admin-index', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/index.html'));
});
app.get('/admin-reviews', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/reviews.html'));
});
app.get('/admin-users', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/admin/users.html'));
});
app.get('/main-about', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/about.html'));
});
app.get('/main-catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/catalog.html'));
});
app.get('/main-category', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/category.html'));
});
app.get('/main-contacts', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/contacts.html'));
});
app.get('/main-details', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/details.html'));
});
app.get('/main-index', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/index.html'));
});
app.get('/main-pricing', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/pricing.html'));
});
app.get('/main-live', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/live.html'));
});
app.get('/main-privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/privacy.html'));
});
app.get('/main-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/profile.html'));
});

// APIs
app.post('/login', loginRoutes);
app.post('/register', registerRoutes);
app.use('/profile', profileRoutes);
app.use('/invoice', invoiceRoutes);
app.use ('/forgot-password', forgotPasswordRoutes)
app.use ('/lock-screen', lockScreenRoutes)
app.use ('/calendar', calendarRoutes)
app.use ('/food-menu', foodMenuRoutes)

//port connection
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

// Get your endpoint online
// ngrok.connect({ addr: PORT, authtoken: '2fotKxHCsy42Bw8D3hEZb56kQuB_3eb38ULL5bDSrRkvyYZJt'})
// 	.then(listener => console.log(`Ingress established at: ${listener.url()}`));
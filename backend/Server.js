require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const pool = require('./src/config'); 
const getUserInfo = require('./src/routes/user'); 
const moment = require('moment');
const timestamp = moment().format('YYYYMMDDHHmmss');
const axios = require('axios');


const app = express();

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('./backend/static'));


// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET, 
    saveUninitialized: true, 
    resave: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'backend/static')));

// User authentication for views
app.use((req, res, next) => {
    res.locals.authenticated = req.cookies.accessToken ? true : false;
    next();
});

// User authentication middleware
app.use(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
        try {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
            const userId = decodedToken.userId;
            const userInfo = await getUserInfo(userId);
            if (userInfo) {
                req.userInfo = userInfo;
                res.locals.userInfo = userInfo;
            }
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                res.clearCookie('accessToken');
            } else {
                console.error('Invalid access token:', err);
            }
        }
    }
    next();
});

// Import routes
const registerRoutes = require('./src/routes/register');
const loginRoutes = require('./src/routes/login');
const indexPageRoutes = require('./src/routes/index-page');
const profileRoutes = require('./src/routes/profile');
const logoutRoute = require('./src/routes/logout');
const createProductRoutes = require('./src/routes/create_product');
const productDetailRoutes = require('./src/routes/product-detail');
const shopRoutes = require('./src/routes/shop');
const cartRoutes = require('./src/routes/cart');
const checkoutRoutes = require('./src/routes/checkout');


// APIs
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/profile', profileRoutes);
app.use('/', indexPageRoutes);
app.use('/logout', logoutRoute);
app.use('/create-product', createProductRoutes);
app.use(productDetailRoutes);
app.use(shopRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);


// Serve static files for pages
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/index.ejs'));
// });


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
// app.get('/product-detail', (req, res) => {
//     res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/xhtml/ecom-product-detail.html'));
// });
app.get('/add-products', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/dashboard/kipfit/main/add-product.html'));
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


//port connection
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});

// Get your endpoint online
// ngrok.connect({ addr: PORT, authtoken: '2fotKxHCsy42Bw8D3hEZb56kQuB_3eb38ULL5bDSrRkvyYZJt'})
// 	.then(listener => console.log(`Ingress established at: ${listener.url()}`));
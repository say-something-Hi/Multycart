const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// EJS Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'ecommerce-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/auth', require('./routes/auth'));

// Frontend Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Home - My Store',
        user: req.session.user 
    });
});

app.get('/shop', (req, res) => {
    res.render('shop', { 
        title: 'Shop - My Store',
        user: req.session.user 
    });
});

app.get('/product/:id', (req, res) => {
    res.render('product-detail', { 
        title: 'Product - My Store',
        user: req.session.user,
        productId: req.params.id
    });
});

app.get('/cart', (req, res) => {
    res.render('cart', { 
        title: 'Cart - My Store',
        user: req.session.user 
    });
});

app.get('/checkout', (req, res) => {
    res.render('checkout', { 
        title: 'Checkout - My Store',
        user: req.session.user 
    });
});

// Admin Routes
app.get('/admin', (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/login');
    }
    res.render('admin/dashboard', { 
        title: 'Admin Dashboard',
        user: req.session.user 
    });
});

app.get('/admin/orders', (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/login');
    }
    res.render('admin/orders', { 
        title: 'Order Management',
        user: req.session.user 
    });
});

app.get('/admin/products', (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/login');
    }
    res.render('admin/products', { 
        title: 'Product Management',
        user: req.session.user 
    });
});

// Auth Routes
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🛒 E-commerce server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin`);
});

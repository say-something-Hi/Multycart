const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            customer,
            startDate,
            endDate,
            search 
        } = req.query;

        const filter = {};
        
        if (status) filter.status = status;
        if (customer) filter.customer = customer;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.lastName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .populate('customer')
            .populate('items.product')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const { items, customerInfo, shipping, payment } = req.body;

        // Validate products and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.product} not found` });
            }

            if (product.trackQuantity && product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for ${product.name}` 
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                variant: item.variant,
                quantity: item.quantity,
                price: product.price,
                total: itemTotal
            });

            // Update product quantity
            if (product.trackQuantity) {
                product.quantity -= item.quantity;
                await product.save();
            }
        }

        // Find or create customer
        let customer = await Customer.findOne({ email: customerInfo.email });
        if (!customer) {
            customer = new Customer({
                email: customerInfo.email,
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                phone: customerInfo.phone
            });
            await customer.save();
        }

        // Create order
        const order = new Order({
            customer: customer._id,
            email: customerInfo.email,
            phone: customerInfo.phone,
            shippingAddress: customerInfo.shippingAddress,
            billingAddress: customerInfo.billingAddress || customerInfo.shippingAddress,
            items: orderItems,
            subtotal: subtotal,
            shipping: shipping,
            tax: 0, // Calculate tax based on location
            discount: customerInfo.discount || { amount: 0 },
            total: subtotal + (shipping.cost || 0),
            payment: payment
        });

        order.calculateTotals();
        await order.save();

        // Update customer stats
        await customer.updateStats();

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status, fulfillment } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                fulfillment: fulfillment || {}
            },
            { new: true }
        ).populate('customer').populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get order statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const monthlyRevenue = await Order.aggregate([
            { 
                $match: { 
                    'payment.status': 'paid',
                    createdAt: { $gte: startOfMonth }
                } 
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const todayOrders = await Order.countDocuments({
            createdAt: { $gte: startOfDay }
        });

        const statusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            todayOrders,
            statusCounts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

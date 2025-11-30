const express = require('express');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        const filter = {};
        
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await Customer.find(filter)
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Customer.countDocuments(filter);

        res.json({
            customers,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get customer details
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get customer orders
        const orders = await Order.find({ customer: req.params.id })
            .sort({ createdAt: -1 })
            .populate('items.product');

        res.json({
            customer,
            orders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get customer statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const orders = await Order.find({ 
            customer: req.params.id,
            'payment.status': 'paid'
        });

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        // Get last order date
        const lastOrder = await Order.findOne({ customer: req.params.id })
            .sort({ createdAt: -1 });

        res.json({
            totalOrders,
            totalSpent,
            averageOrderValue,
            lastOrderDate: lastOrder?.createdAt,
            customerSince: customer.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

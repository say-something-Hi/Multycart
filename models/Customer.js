const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    firstName: String,
    lastName: String,
    phone: String,
    addresses: [{
        type: {
            type: String,
            enum: ['billing', 'shipping'],
            default: 'shipping'
        },
        firstName: String,
        lastName: String,
        company: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
        default: Boolean
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    totalSpent: {
        type: Number,
        default: 0
    },
    orderCount: {
        type: Number,
        default: 0
    },
    tags: [String],
    notes: String,
    acceptsMarketing: {
        type: Boolean,
        default: false
    },
    taxExempt: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update customer stats when order is created
customerSchema.methods.updateStats = async function() {
    const Order = mongoose.model('Order');
    const orders = await Order.find({ customer: this._id, 'payment.status': 'paid' });
    
    this.orderCount = orders.length;
    this.totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    await this.save();
};

module.exports = mongoose.model('Customer', customerSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    shippingAddress: {
        firstName: String,
        lastName: String,
        company: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    billingAddress: {
        firstName: String,
        lastName: String,
        company: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    shipping: {
        method: String,
        cost: {
            type: Number,
            default: 0
        }
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        code: String,
        amount: {
            type: Number,
            default: 0
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    payment: {
        method: String,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        gateway: String
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    fulfillment: {
        status: {
            type: String,
            enum: ['unfulfilled', 'fulfilled', 'partially-fulfilled'],
            default: 'unfulfilled'
        },
        trackingNumber: String,
        carrier: String
    },
    notes: String,
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${(count + 1).toString().padStart(6, '0')}`;
    }
    next();
});

// Calculate totals
orderSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal + this.shipping.cost + this.tax - this.discount.amount;
};

module.exports = mongoose.model('Order', orderSchema);

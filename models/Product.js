const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0
    },
    costPerItem: {
        type: Number,
        min: 0
    },
    sku: {
        type: String,
        unique: true
    },
    barcode: String,
    trackQuantity: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    continueSelling: {
        type: Boolean,
        default: true
    },
    physicalProduct: {
        type: Boolean,
        default: true
    },
    weight: Number,
    weightUnit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg'
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tags: [String],
    images: [{
        url: String,
        alt: String
    }],
    status: {
        type: String,
        enum: ['active', 'draft', 'archived'],
        default: 'active'
    },
    seo: {
        title: String,
        description: String,
        slug: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    variants: [{
        name: String,
        options: [String],
        prices: [Number],
        quantities: [Number]
    }],
    shipping: {
        required: Boolean,
        price: Number
    },
    tax: {
        taxable: Boolean,
        rate: Number
    }
}, {
    timestamps: true
});

// Virtual for sale price calculation
productSchema.virtual('salePrice').get(function() {
    return this.comparePrice && this.comparePrice > this.price ? this.comparePrice : this.price;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
    return !this.trackQuantity || this.quantity > 0;
});

module.exports = mongoose.model('Product', productSchema);

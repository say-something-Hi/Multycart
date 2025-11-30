const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: String,
    lastName: String,
    role: {
        type: String,
        enum: ['admin', 'manager', 'staff'],
        default: 'staff'
    },
    permissions: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        timezone: String,
        currency: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

module.exports = mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null // For percentage discounts
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userLimit: {
        type: Number,
        default: 1 // How many times a single user can use this coupon
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    excludedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableUserTypes: [{
        type: String,
        enum: ['customer', 'new', 'returning', 'all']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();

    // Check if coupon is active
    if (!this.isActive) return { valid: false, message: 'Coupon is not active' };

    // Check date range
    if (now < this.startDate) return { valid: false, message: 'Coupon is not yet valid' };
    if (now > this.endDate) return { valid: false, message: 'Coupon has expired' };

    // Check usage limit
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }

    return { valid: true, message: 'Coupon is valid' };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderValue) {
    if (orderValue < this.minOrderValue) {
        return {
            applicable: false,
            message: `Minimum order value of ₹${this.minOrderValue} required`
        };
    }

    let discount = 0;

    if (this.discountType === 'percentage') {
        discount = (orderValue * this.discountValue) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.discountValue;
    }

    return {
        applicable: true,
        discount: Math.round(discount * 100) / 100
    };
};

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;

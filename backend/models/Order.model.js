import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        variant: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        image: String
    }],
    deliveryAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        landmark: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        deliveryCharge: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    payment: {
        method: {
            type: String,
            enum: ['cod', 'online', 'card', 'upi', 'wallet'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        paidAt: Date,
        refundId: String,
        refundedAt: Date
    },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
        default: 'placed'
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    deliverySlot: {
        date: Date,
        timeSlot: String // e.g., "9:00 AM - 12:00 PM"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    appliedCoupon: {
        code: String,
        discount: Number
    },
    notes: {
        customer: String,
        internal: String
    },
    cancelReason: String,
    cancelledAt: Date,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveredAt: Date,
    estimatedDelivery: Date,
    invoice: {
        number: String,
        url: String,
        generatedAt: Date
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `DM${Date.now()}${(count + 1).toString().padStart(4, '0')}`;

        // Add initial status to history
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date()
        });
    }
    next();
});

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus, note = '', updatedBy = null) {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note,
        updatedBy
    });

    // Update specific timestamps
    if (newStatus === 'delivered') {
        this.deliveredAt = new Date();
        this.payment.status = 'completed';
        if (this.payment.method === 'cod') {
            this.payment.paidAt = new Date();
        }
    } else if (newStatus === 'cancelled') {
        this.cancelledAt = new Date();
    }
};

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

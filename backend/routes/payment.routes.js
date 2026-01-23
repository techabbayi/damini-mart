import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';

const router = express.Router();

// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn('⚠️  Razorpay credentials not configured. Online payments will not work.');
}

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    if (!razorpay) {
        throw new ErrorResponse('Payment gateway not configured. Please contact support.', 503);
    }

    // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    // Create Razorpay order
    const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
            orderId: order._id.toString(),
            userId: req.user._id.toString()
        }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
        success: true,
        data: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        }
    });
}));

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Generate signature
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    // Verify signature
    if (generatedSignature !== razorpaySignature) {
        throw new ErrorResponse('Invalid payment signature', 400);
    }

    // Update order
    const order = await Order.findById(orderId);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    order.payment.status = 'completed';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.paidAt = new Date();
    order.updateStatus('confirmed', 'Payment received');

    await order.save();

    res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { order }
    });
}));

/**
 * @route   POST /api/payments/cod-confirm
 * @desc    Confirm COD payment (for cashier)
 * @access  Private (Cashier, Manager, Admin)
 */
router.post('/cod-confirm', asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Check role
    if (!['cashier', 'manager', 'admin'].includes(req.user.role)) {
        throw new ErrorResponse('Not authorized', 403);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    if (order.payment.method !== 'cod') {
        throw new ErrorResponse('Order is not COD', 400);
    }

    order.payment.status = 'completed';
    order.payment.paidAt = new Date();

    await order.save();

    res.json({
        success: true,
        message: 'COD payment confirmed',
        data: { order }
    });
}));

export default router;

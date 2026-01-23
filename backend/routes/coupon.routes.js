import express from 'express';
import Coupon from '../models/Coupon.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';
import { couponValidation, mongoIdValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

// Get all active coupons (for customers)
router.get('/', asyncHandler(async (req, res) => {
    const now = new Date();
    const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).select('-usedCount -createdBy');

    res.json({ success: true, data: { coupons } });
}));

// Validate coupon
router.post('/validate', asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        throw new ErrorResponse('Invalid coupon code', 404);
    }

    const validation = coupon.isValid();
    if (!validation.valid) {
        throw new ErrorResponse(validation.message, 400);
    }

    const discountResult = coupon.calculateDiscount(orderValue);

    res.json({
        success: true,
        data: {
            valid: discountResult.applicable,
            message: discountResult.message,
            discount: discountResult.discount || 0
        }
    });
}));

// Manager/Admin routes
router.use(authorize('manager', 'admin'));

// Create coupon
router.post('/', couponValidation, asyncHandler(async (req, res) => {
    const coupon = await Coupon.create({
        ...req.body,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Coupon created',
        data: { coupon }
    });
}));

// Get all coupons (including inactive)
router.get('/all', asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort('-createdAt');

    res.json({ success: true, data: { coupons } });
}));

// Update coupon
router.put('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!coupon) {
        throw new ErrorResponse('Coupon not found', 404);
    }

    res.json({
        success: true,
        message: 'Coupon updated',
        data: { coupon }
    });
}));

// Delete coupon
router.delete('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!coupon) {
        throw new ErrorResponse('Coupon not found', 404);
    }

    res.json({ success: true, message: 'Coupon deleted' });
}));

export default router;

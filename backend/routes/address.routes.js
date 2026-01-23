import express from 'express';
import Address from '../models/Address.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';
import { addressValidation, mongoIdValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all addresses for user
router.get('/', asyncHandler(async (req, res) => {
    const addresses = await Address.find({ user: req.user._id, isActive: true }).sort('-isDefault');

    res.json({ success: true, data: { addresses } });
}));

// Get address by ID
router.get('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
        throw new ErrorResponse('Address not found', 404);
    }

    res.json({ success: true, data: { address } });
}));

// Create new address
router.post('/', addressValidation, asyncHandler(async (req, res) => {
    const address = await Address.create({
        ...req.body,
        user: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Address added',
        data: { address }
    });
}));

// Update address
router.put('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
        throw new ErrorResponse('Address not found', 404);
    }

    address = await Address.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Address updated',
        data: { address }
    });
}));

// Delete address (soft delete)
router.delete('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
        throw new ErrorResponse('Address not found', 404);
    }

    address.isActive = false;
    await address.save();

    res.json({ success: true, message: 'Address deleted' });
}));

// Set default address
router.put('/:id/set-default', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
        throw new ErrorResponse('Address not found', 404);
    }

    address.isDefault = true;
    await address.save();

    res.json({
        success: true,
        message: 'Default address updated',
        data: { address }
    });
}));

export default router;

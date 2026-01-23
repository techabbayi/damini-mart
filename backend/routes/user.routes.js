import express from 'express';
import User from '../models/User.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

// All routes require authentication and admin/manager role
router.use(authenticate);
router.use(authorize('manager', 'admin'));

// Get all users
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -refreshToken')
        .populate('addresses');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user } });
}));

// Update user role
router.put('/:id/role', asyncHandler(async (req, res) => {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
        success: true,
        message: 'User role updated',
        data: { user }
    });
}));

// Toggle user active status
router.put('/:id/toggle-active', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
        data: { user }
    });
}));

export default router;

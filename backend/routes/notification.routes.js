import express from 'express';
import Notification from '../models/Notification.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.use(authenticate);

// Get user notifications
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Notification.countDocuments({ user: req.user._id });
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({
        success: true,
        data: {
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
}));

// Mark notification as read
router.put('/:id/read', asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (notification) {
        notification.markAsRead();
        await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
}));

// Mark all as read
router.put('/mark-all-read', asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
}));

// Delete notification
router.delete('/:id', asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    res.json({ success: true, message: 'Notification deleted' });
}));

export default router;

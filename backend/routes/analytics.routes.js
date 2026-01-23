import express from 'express';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('manager', 'admin'));

// Get dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // Total orders
    const totalOrders = await Order.countDocuments(dateFilter);

    // Revenue
    const revenueData = await Order.aggregate([
        { $match: { ...dateFilter, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.total' }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' }
    ]);

    // Customer stats
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomers = await User.countDocuments({ role: 'customer', ...dateFilter });

    res.json({
        success: true,
        data: {
            totalOrders,
            totalRevenue,
            ordersByStatus,
            topProducts,
            totalCustomers,
            newCustomers
        }
    });
}));

// Sales report
router.get('/sales', asyncHandler(async (req, res) => {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let groupFormat = '%Y-%m-%d';
    if (groupBy === 'month') groupFormat = '%Y-%m';
    if (groupBy === 'year') groupFormat = '%Y';

    const salesData = await Order.aggregate([
        {
            $match: {
                'payment.status': 'completed',
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: { $sum: '$pricing.total' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: { salesData } });
}));

// Top products report
router.get('/top-products', asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.total' }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                _id: 1,
                name: '$productInfo.name',
                brand: '$productInfo.brand',
                totalSold: 1,
                totalRevenue: 1
            }
        }
    ]);

    res.json({
        success: true,
        data: { topProducts }
    });
}));

// Overview/Summary stats
router.get('/overview', asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const todayRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    // Month's stats
    const monthOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
    const monthRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    // Overall stats
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Active orders (not delivered/cancelled)
    const activeOrders = await Order.countDocuments({
        status: { $in: ['placed', 'confirmed', 'processing', 'packed', 'out_for_delivery'] }
    });

    res.json({
        success: true,
        data: {
            today: {
                orders: todayOrders,
                revenue: todayRevenue[0]?.total || 0
            },
            month: {
                orders: monthOrders,
                revenue: monthRevenue[0]?.total || 0
            },
            overall: {
                totalOrders,
                totalCustomers,
                totalProducts,
                activeOrders
            }
        }
    });
}));

export default router;

import express from 'express';
import Product from '../models/Product.model.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('manager', 'admin'));

// Get low stock products
router.get('/low-stock', asyncHandler(async (req, res) => {
    const products = await Product.find({
        isActive: true,
        $or: [
            { stock: { $lte: 10, $gt: 0 } },
            { 'variants.stock': { $lte: 10, $gt: 0 } }
        ]
    }).select('name stock variants');

    res.json({ success: true, data: { products } });
}));

// Get out of stock products
router.get('/out-of-stock', asyncHandler(async (req, res) => {
    const products = await Product.find({
        isActive: true,
        $or: [
            { stock: 0 },
            { 'variants.stock': 0 }
        ]
    }).select('name stock variants');

    res.json({ success: true, data: { products } });
}));

// Bulk update stock
router.put('/bulk-update', asyncHandler(async (req, res) => {
    const { updates } = req.body; // Array of { productId, stock, variantName }

    for (const update of updates) {
        const product = await Product.findById(update.productId);
        if (product) {
            if (update.variantName) {
                const variant = product.variants.find(v => v.name === update.variantName);
                if (variant) variant.stock = update.stock;
            } else {
                product.stock = update.stock;
            }
            await product.save();
        }
    }

    res.json({
        success: true,
        message: 'Stock updated successfully'
    });
}));

export default router;

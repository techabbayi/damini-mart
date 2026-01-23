import express from 'express';
import Category from '../models/Category.model.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';
import { categoryValidation, mongoIdValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(async (req, res) => {
    const { parent } = req.query;

    const filter = { isActive: true };
    if (parent) filter.parent = parent === 'null' ? null : parent;

    const categories = await Category.find(filter)
        .populate('parent', 'name slug')
        .sort('displayOrder');

    res.json({ success: true, data: { categories } });
}));

router.get('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate('parent');

    if (!category) {
        throw new ErrorResponse('Category not found', 404);
    }

    res.json({ success: true, data: { category } });
}));

// Protected routes - Manager/Admin only
router.use(authenticate);
router.use(authorize('manager', 'admin'));

router.post('/', categoryValidation, asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Category created',
        data: { category }
    });
}));

router.put('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new ErrorResponse('Category not found', 404);
    }

    res.json({
        success: true,
        message: 'Category updated',
        data: { category }
    });
}));

router.delete('/:id', mongoIdValidation('id'), asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!category) {
        throw new ErrorResponse('Category not found', 404);
    }

    res.json({ success: true, message: 'Category deleted' });
}));

export default router;

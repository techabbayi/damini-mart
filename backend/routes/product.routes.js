import express from 'express';
import {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getFeaturedProducts,
    getBestsellers,
    getNewArrivals
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
    createProductValidation,
    updateProductValidation,
    mongoIdValidation,
    paginationValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', mongoIdValidation('id'), getProductById);

// Protected routes - Manager/Admin only
router.use(authenticate);
router.use(authorize('manager', 'admin'));

router.post('/', createProductValidation, createProduct);
router.put('/:id', updateProductValidation, updateProduct);
router.delete('/:id', mongoIdValidation('id'), deleteProduct);
router.put('/:id/stock', mongoIdValidation('id'), updateStock);

export default router;

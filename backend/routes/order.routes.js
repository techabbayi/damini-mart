import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    assignOrder,
    cancelOrder
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createOrderValidation, mongoIdValidation, paginationValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', createOrderValidation, createOrder);
router.get('/my-orders', paginationValidation, getMyOrders);
router.get('/:id', mongoIdValidation('id'), getOrderById);
router.put('/:id/cancel', mongoIdValidation('id'), cancelOrder);

// Staff routes
router.get('/all/list', authorize('cashier', 'manager', 'admin'), paginationValidation, getAllOrders);
router.put('/:id/status', authorize('cashier', 'manager', 'admin'), mongoIdValidation('id'), updateOrderStatus);
router.put('/:id/assign', authorize('manager', 'admin'), mongoIdValidation('id'), assignOrder);

export default router;

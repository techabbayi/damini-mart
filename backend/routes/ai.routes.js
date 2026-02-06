import express from 'express';
import {
    getAIRecommendations,
    aiSmartSearch,
    aiChatbot,
    generateProductDescription,
    analyzePricing
} from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/search', aiSmartSearch);

// Protected routes
router.get('/recommendations', protect, getAIRecommendations);
router.post('/chatbot', protect, aiChatbot);

// Admin routes
router.post('/generate-description', protect, authorize('admin', 'manager'), generateProductDescription);
router.get('/price-analysis/:productId', protect, authorize('admin', 'manager'), analyzePricing);

export default router;

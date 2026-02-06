import express from 'express';
import { 
    getMyReferralCode, 
    applyReferralCode, 
    getReferralStats,
    getAllReferrals 
} from '../controllers/referral.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.get('/my-code', protect, getMyReferralCode);
router.post('/apply', protect, applyReferralCode);
router.get('/stats', protect, getReferralStats);

// Admin only routes
router.get('/all', protect, authorize('admin', 'manager'), getAllReferrals);

export default router;

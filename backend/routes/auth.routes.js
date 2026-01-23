import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    updateProfile,
    changePassword,
    updateFCMToken
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { registerValidation, loginValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/update-fcm-token', updateFCMToken);

export default router;

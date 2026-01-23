import express from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/', wishlistController.addToWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkWishlist);

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete('/clear/all', wishlistController.clearWishlist);

// Move items to cart
router.post('/move-to-cart', wishlistController.moveToCart);

export default router;

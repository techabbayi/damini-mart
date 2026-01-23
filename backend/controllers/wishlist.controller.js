import Wishlist from '../models/Wishlist.model.js';
import Product from '../models/Product.model.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name slug price comparePrice images stock brand category isActive'
            });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, items: [] });
        }

        // Filter out inactive products
        wishlist.items = wishlist.items.filter(item =>
            item.product && item.product.isActive
        );

        res.json({
            success: true,
            data: {
                wishlist: wishlist.items.map(item => ({
                    _id: item._id,
                    product: item.product,
                    addedAt: item.addedAt
                }))
            }
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist'
        });
    }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Get or create wishlist
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                items: []
            });
        }

        // Check if product already in wishlist
        const existingItem = wishlist.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        // Add to wishlist
        wishlist.items.push({
            product: productId,
            addedAt: new Date()
        });

        await wishlist.save();

        // Populate product details
        await wishlist.populate({
            path: 'items.product',
            select: 'name slug price comparePrice images stock brand category isActive'
        });

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            data: {
                wishlist: wishlist.items.map(item => ({
                    _id: item._id,
                    product: item.product,
                    addedAt: item.addedAt
                }))
            }
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add product to wishlist'
        });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        // Remove item
        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(
            item => item.product.toString() !== productId
        );

        if (wishlist.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        await wishlist.save();

        // Populate product details
        await wishlist.populate({
            path: 'items.product',
            select: 'name slug price comparePrice images stock brand category isActive'
        });

        res.json({
            success: true,
            message: 'Product removed from wishlist',
            data: {
                wishlist: wishlist.items.map(item => ({
                    _id: item._id,
                    product: item.product,
                    addedAt: item.addedAt
                }))
            }
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove product from wishlist'
        });
    }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.json({
            success: true,
            message: 'Wishlist cleared',
            data: {
                wishlist: []
            }
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist'
        });
    }
};

// Check if product is in wishlist
export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        const isInWishlist = wishlist && wishlist.items.some(
            item => item.product.toString() === productId
        );

        res.json({
            success: true,
            data: {
                isInWishlist
            }
        });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check wishlist'
        });
    }
};

// Move wishlist items to cart
export const moveToCart = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs array is required'
            });
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        // Here you would integrate with cart controller to add items
        // For now, just remove from wishlist
        wishlist.items = wishlist.items.filter(
            item => !productIds.includes(item.product.toString())
        );

        await wishlist.save();

        res.json({
            success: true,
            message: 'Products moved to cart',
            data: {
                movedCount: productIds.length
            }
        });
    } catch (error) {
        console.error('Move to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to move products to cart'
        });
    }
};

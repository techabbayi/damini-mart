import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: 'items.product',
            select: 'name slug images price stock variants'
        })
        .populate('appliedCoupon');

    if (!cart) {
        cart = await Cart.create({ user: req.user._id });
    }

    res.json({
        success: true,
        data: { cart }
    });
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, variantName, quantity = 1 } = req.body;

    // Find product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ErrorResponse('Product not found', 404);
    }

    // Check stock and get price
    let price = product.price;
    let availableStock = product.stock;

    // If product has variants, variant is required
    if (product.variants && product.variants.length > 0) {
        if (!variantName) {
            throw new ErrorResponse(`Please select a variant for ${product.name}`, 400);
        }

        const variant = product.variants.find(v => v.name === variantName);
        if (!variant) {
            throw new ErrorResponse(`Variant "${variantName}" not found`, 404);
        }
        price = variant.price;
        availableStock = variant.stock;
    }

    if (typeof availableStock === 'number' && availableStock < quantity) {
        const variantInfo = variantName ? ` (${variantName})` : '';
        throw new ErrorResponse(`Insufficient stock for ${product.name}${variantInfo}. Only ${availableStock} available.`, 400);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id });
    }

    // Add item to cart
    cart.addItem(productId, variantName, quantity, price);
    await cart.save();

    // Populate and return cart
    cart = await Cart.findById(cart._id)
        .populate({
            path: 'items.product',
            select: 'name slug images price stock variants'
        });

    res.json({
        success: true,
        message: 'Item added to cart',
        data: { cart }
    });
});

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, variantName, quantity } = req.body;

    if (quantity < 1) {
        throw new ErrorResponse('Quantity must be at least 1', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    // Check stock
    const product = await Product.findById(productId);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    let availableStock = product.stock;
    let productName = product.name;

    if (variantName) {
        const variant = product.variants.find(v => v.name === variantName);
        if (!variant) {
            throw new ErrorResponse(`Variant "${variantName}" not found`, 404);
        }
        availableStock = variant.stock;
    }

    if (typeof availableStock === 'number' && availableStock < quantity) {
        const variantInfo = variantName ? ` (${variantName})` : '';
        throw new ErrorResponse(`Insufficient stock for ${productName}${variantInfo}. Only ${availableStock} available.`, 400);
    }

    // Update quantity
    cart.updateItemQuantity(productId, variantName, quantity);
    await cart.save();

    // Populate and return cart
    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'items.product',
            select: 'name slug images price stock variants'
        });

    res.json({
        success: true,
        message: 'Cart updated',
        data: { cart: updatedCart }
    });
});

/**
 * @route   DELETE /api/cart/remove
 * @desc    Remove item from cart
 * @access  Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId, variantName } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    cart.removeItem(productId, variantName);
    await cart.save();

    // Populate and return cart
    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'items.product',
            select: 'name slug images price stock variants'
        });

    res.json({
        success: true,
        message: 'Item removed from cart',
        data: { cart: updatedCart }
    });
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    cart.clearCart();
    await cart.save();

    res.json({
        success: true,
        message: 'Cart cleared'
    });
});

/**
 * @route   POST /api/cart/apply-coupon
 * @desc    Apply coupon to cart
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    // Find coupon
    const Coupon = (await import('../models/Coupon.model.js')).default;
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
        throw new ErrorResponse('Invalid coupon code', 404);
    }

    // Validate coupon
    const validation = coupon.isValid();
    if (!validation.valid) {
        throw new ErrorResponse(validation.message, 400);
    }

    // Calculate discount
    const discountResult = coupon.calculateDiscount(cart.subtotal);
    if (!discountResult.applicable) {
        throw new ErrorResponse(discountResult.message, 400);
    }

    // Apply coupon
    cart.appliedCoupon = coupon._id;
    cart.discount = discountResult.discount;
    await cart.save();

    // Populate and return cart
    const updatedCart = await Cart.findById(cart._id)
        .populate({
            path: 'items.product',
            select: 'name slug images price stock variants'
        })
        .populate('appliedCoupon');

    res.json({
        success: true,
        message: 'Coupon applied successfully',
        data: { cart: updatedCart }
    });
});

/**
 * @route   DELETE /api/cart/remove-coupon
 * @desc    Remove coupon from cart
 * @access  Private
 */
export const removeCoupon = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        throw new ErrorResponse('Cart not found', 404);
    }

    cart.appliedCoupon = null;
    cart.discount = 0;
    await cart.save();

    res.json({
        success: true,
        message: 'Coupon removed'
    });
});

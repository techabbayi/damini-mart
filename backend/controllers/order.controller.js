import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { items, deliveryAddress, payment, deliverySlot, notes } = req.body;

    if (!deliveryAddress) {
        throw new ErrorResponse('Please select a delivery address', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ErrorResponse('Cart is empty', 400);
    }

    // Ensure payment method defaults to cod
    const paymentInfo = payment || { method: 'cod', status: 'pending' };
    if (!paymentInfo.method) {
        paymentInfo.method = 'cod';
    }
    if (!paymentInfo.status) {
        paymentInfo.status = 'pending';
    }

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product || !product.isActive) {
            throw new ErrorResponse(`Product ${item.product} not found`, 404);
        }

        let price = product.price;
        let stock = product.stock;
        let variantName = null;

        // If product has variants, variant selection is required
        if (product.variants && product.variants.length > 0) {
            if (!item.variant) {
                throw new ErrorResponse(`Please select a variant for ${product.name}`, 400);
            }

            const variant = product.variants.find(v => v.name === item.variant);
            if (!variant) {
                throw new ErrorResponse(`Variant "${item.variant}" not found for ${product.name}`, 404);
            }
            price = variant.price;
            stock = variant.stock;
            variantName = variant.name;
        }

        // Check stock availability
        if (typeof stock === 'number' && stock < item.quantity) {
            const variantInfo = variantName ? ` (${variantName})` : '';
            throw new ErrorResponse(`Insufficient stock for ${product.name}${variantInfo}. Only ${stock} available.`, 400);
        }

        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            variant: item.variant || null,
            quantity: item.quantity,
            price,
            total: itemTotal,
            image: product.images[0]?.url || null
        });

        // Update stock
        if (item.variant) {
            const variant = product.variants.find(v => v.name === item.variant);
            variant.stock -= item.quantity;
        } else {
            product.stock -= item.quantity;
        }
        await product.save();
    }

    // Calculate delivery charge
    const deliveryCharge = subtotal >= parseInt(process.env.FREE_DELIVERY_THRESHOLD || 500)
        ? 0
        : parseInt(process.env.BASE_DELIVERY_CHARGE || 40);

    // Get cart for coupon discount
    const cart = await Cart.findOne({ user: req.user._id }).populate('appliedCoupon');
    let discount = 0;
    let appliedCoupon = null;

    if (cart?.appliedCoupon) {
        discount = cart.discount || 0;
        appliedCoupon = {
            code: cart.appliedCoupon.code,
            discount
        };
    }

    const tax = 0; // Add tax calculation if needed
    const total = subtotal - discount + deliveryCharge + tax;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        deliveryAddress,
        pricing: {
            subtotal,
            discount,
            deliveryCharge,
            tax,
            total
        },
        payment: paymentInfo,
        deliverySlot,
        appliedCoupon,
        notes
    });

    // Clear cart after order
    if (cart) {
        cart.clearCart();
        await cart.save();
    }

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order }
    });
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
        success: true,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name slug images');

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    // Check if user owns the order or is staff
    if (order.user._id.toString() !== req.user._id.toString() &&
        !['cashier', 'manager', 'admin'].includes(req.user.role)) {
        throw new ErrorResponse('Not authorized to access this order', 403);
    }

    res.json({
        success: true,
        data: { order }
    });
});

/**
 * @route   GET /api/orders/all
 * @desc    Get all orders (for staff)
 * @access  Private (Cashier, Manager, Admin)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
        filter.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'deliveryAddress.phone': { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
        success: true,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Cashier, Manager, Admin)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    order.updateStatus(status, note, req.user._id);
    await order.save();

    res.json({
        success: true,
        message: 'Order status updated',
        data: { order }
    });
});

/**
 * @route   PUT /api/orders/:id/assign
 * @desc    Assign order to delivery person
 * @access  Private (Manager, Admin)
 */
export const assignOrder = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { assignedTo: userId },
        { new: true }
    );

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    res.json({
        success: true,
        message: 'Order assigned successfully',
        data: { order }
    });
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ErrorResponse('Order not found', 404);
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() &&
        !['manager', 'admin'].includes(req.user.role)) {
        throw new ErrorResponse('Not authorized', 403);
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
        throw new ErrorResponse(`Cannot cancel ${order.status} order`, 400);
    }

    order.updateStatus('cancelled', reason, req.user._id);
    order.cancelReason = reason;
    order.cancelledBy = req.user._id;
    await order.save();

    // Restore stock
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            if (item.variant) {
                const variant = product.variants.find(v => v.name === item.variant);
                if (variant) variant.stock += item.quantity;
            } else {
                product.stock += item.quantity;
            }
            await product.save();
        }
    }

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order }
    });
});

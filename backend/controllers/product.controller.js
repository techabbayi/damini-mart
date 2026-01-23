import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Review from '../models/Review.model.js'; // Import Review model to register it with Mongoose
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        category,
        subcategory,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        order = 'desc',
        isFeatured,
        isBestseller,
        isNewArrival,
        inStock
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (isFeatured) filter.isFeatured = isFeatured === 'true';
    if (isBestseller) filter.isBestseller = isBestseller === 'true';
    if (isNewArrival) filter.isNewArrival = isNewArrival === 'true';

    // Price filter
    if (minPrice || maxPrice) {
        filter.$or = [
            { price: { ...(minPrice && { $gte: parseFloat(minPrice) }), ...(maxPrice && { $lte: parseFloat(maxPrice) }) } },
            { 'variants.price': { ...(minPrice && { $gte: parseFloat(minPrice) }), ...(maxPrice && { $lte: parseFloat(maxPrice) }) } }
        ];
    }

    // Search filter
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    // Stock filter
    if (inStock === 'true') {
        filter.$or = [
            { stock: { $gt: 0 } },
            { 'variants.stock': { $gt: 0 } }
        ];
    }

    // Sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count
    const total = await Product.countDocuments(filter);

    res.json({
        success: true,
        data: {
            products,
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
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate({
            path: 'reviews',
            populate: { path: 'user', select: 'name avatar' }
        });

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    res.json({
        success: true,
        data: { product }
    });
});

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .populate({
            path: 'reviews',
            populate: { path: 'user', select: 'name avatar' }
        });

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    res.json({
        success: true,
        data: { product }
    });
});

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Manager, Admin)
 */
export const createProduct = asyncHandler(async (req, res) => {
    // Verify category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
        throw new ErrorResponse('Category not found', 404);
    }

    // Create product
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
    });
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Manager, Admin)
 */
export const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    // If category is being updated, verify it exists
    if (req.body.category) {
        const category = await Category.findById(req.body.category);
        if (!category) {
            throw new ErrorResponse('Category not found', 404);
        }
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
    });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete - set isActive to false)
 * @access  Private (Manager, Admin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

/**
 * @route   PUT /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Manager, Admin)
 */
export const updateStock = asyncHandler(async (req, res) => {
    const { stock, variantName } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ErrorResponse('Product not found', 404);
    }

    if (variantName) {
        // Update variant stock
        const variant = product.variants.find(v => v.name === variantName);
        if (!variant) {
            throw new ErrorResponse('Variant not found', 404);
        }
        variant.stock = stock;
    } else {
        // Update main product stock
        product.stock = stock;
    }

    await product.save();

    res.json({
        success: true,
        message: 'Stock updated successfully',
        data: { product }
    });
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true, isFeatured: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt');

    res.json({
        success: true,
        data: { products }
    });
});

/**
 * @route   GET /api/products/bestsellers
 * @desc    Get bestseller products
 * @access  Public
 */
export const getBestsellers = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true, isBestseller: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt');

    res.json({
        success: true,
        data: { products }
    });
});

/**
 * @route   GET /api/products/new-arrivals
 * @desc    Get new arrival products
 * @access  Public
 */
export const getNewArrivals = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true, isNewArrival: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt');

    res.json({
        success: true,
        data: { products }
    });
});

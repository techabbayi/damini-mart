import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation result handler
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * User validation rules
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
];

export const loginValidation = [
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

/**
 * Product validation rules
 */
export const createProductValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required'),
    body('description')
        .trim()
        .notEmpty().withMessage('Product description is required'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    validate
];

export const updateProductValidation = [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Product name cannot be empty'),
    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    validate
];

/**
 * Order validation rules
 */
export const createOrderValidation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product')
        .isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress')
        .notEmpty().withMessage('Delivery address is required')
        .isObject().withMessage('Delivery address must be an object'),
    body('deliveryAddress.fullName')
        .optional()
        .trim()
        .notEmpty().withMessage('Full name is required in delivery address'),
    body('deliveryAddress.phone')
        .optional()
        .trim()
        .notEmpty().withMessage('Phone is required in delivery address'),
    body('payment')
        .optional()
        .isObject().withMessage('Payment must be an object'),
    body('payment.method')
        .optional()
        .isIn(['cod', 'online', 'card', 'upi', 'wallet']).withMessage('Invalid payment method'),
    validate
];

/**
 * Address validation rules
 */
export const addressValidation = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required'),
    body('phone')
        .trim()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('addressLine1')
        .trim()
        .notEmpty().withMessage('Address line 1 is required'),
    body('city')
        .trim()
        .notEmpty().withMessage('City is required'),
    body('state')
        .trim()
        .notEmpty().withMessage('State is required'),
    body('pincode')
        .trim()
        .matches(/^[0-9]{6}$/).withMessage('Please provide a valid 6-digit pincode'),
    body('type')
        .optional()
        .isIn(['home', 'work', 'other']).withMessage('Invalid address type'),
    validate
];

/**
 * Category validation rules
 */
export const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required'),
    body('parent')
        .optional()
        .isMongoId().withMessage('Invalid parent category ID'),
    validate
];

/**
 * Coupon validation rules
 */
export const couponValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('Coupon code is required')
        .toUpperCase(),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('discountType')
        .isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue')
        .isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('startDate')
        .isISO8601().withMessage('Invalid start date'),
    body('endDate')
        .isISO8601().withMessage('Invalid end date')
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    validate
];

/**
 * Pagination validation
 */
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
];

/**
 * MongoDB ID validation
 */
export const mongoIdValidation = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
    validate
];

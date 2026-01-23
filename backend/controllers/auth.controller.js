import User from '../models/User.model.js';
import Cart from '../models/Cart.model.js';
import { asyncHandler, ErrorResponse } from '../middleware/error.middleware.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    setAuthCookies,
    clearAuthCookies
} from '../utils/jwt.utils.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existingUser) {
        throw new ErrorResponse(
            existingUser.email === email ? 'Email already registered' : 'Phone number already registered',
            400
        );
    }

    // Create user
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role: role === 'customer' || !role ? 'customer' : role // Only allow customer registration by default
    });

    // Create cart for user
    await Cart.create({ user: user._id });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;

    // Validate input
    if ((!email && !phone) || !password) {
        throw new ErrorResponse('Please provide email/phone and password', 400);
    }

    // Find user
    const user = await User.findOne({
        $or: [{ email }, { phone }]
    }).select('+password +refreshToken');

    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
        throw new ErrorResponse('Your account has been deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ErrorResponse('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Remove sensitive data
    user.password = undefined;
    user.refreshToken = undefined;

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body || req.cookies;

    if (!token) {
        throw new ErrorResponse('Refresh token required', 401);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
        throw new ErrorResponse('Invalid refresh token', 401);
    }

    // Find user
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
        throw new ErrorResponse('Invalid refresh token', 401);
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken,
            refreshToken: newRefreshToken
        }
    });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Clear cookies
    clearAuthCookies(res);

    res.json({
        success: true,
        message: 'Logout successful'
    });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('addresses')
        .populate('cart');

    res.json({
        success: true,
        data: { user }
    });
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ErrorResponse('Please provide current and new password', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
        throw new ErrorResponse('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

/**
 * @route   POST /api/auth/update-fcm-token
 * @desc    Update FCM token for push notifications
 * @access  Private
 */
export const updateFCMToken = asyncHandler(async (req, res) => {
    const { fcmToken } = req.body;

    if (!fcmToken) {
        throw new ErrorResponse('FCM token required', 400);
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });

    res.json({
        success: true,
        message: 'FCM token updated successfully'
    });
});

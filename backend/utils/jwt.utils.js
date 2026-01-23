import jwt from 'jsonwebtoken';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '1d' }
    );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
    const accessTokenExpire = parseInt(process.env.JWT_ACCESS_EXPIRE) || 1;
    const refreshTokenExpire = parseInt(process.env.JWT_REFRESH_EXPIRE) || 30;

    // Set access token cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: accessTokenExpire * 24 * 60 * 60 * 1000
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000
    });
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
    res.cookie('accessToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
};

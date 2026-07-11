import jwt from 'jsonwebtoken';

/**
 * Generate a JWT and optionally set an httpOnly cookie.
 * @param {Response} res   - Express response object
 * @param {string}   userId
 * @param {boolean}  rememberMe - true = 30-day token, false = 1-day token
 */
const generateToken = (res, userId, rememberMe = false) => {
    const expiresIn = rememberMe ? '30d' : '1d';
    const maxAge   = rememberMe
        ? 30 * 24 * 60 * 60 * 1000   // 30 days in ms
        :      24 * 60 * 60 * 1000;  // 1 day in ms

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge
    });

    return token;
};

export default generateToken;

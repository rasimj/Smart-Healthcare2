import rateLimit from 'express-rate-limit';

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limiter (stricter for file uploads)
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 uploads per hour
    message: {
        success: false,
        message: 'Too many file uploads. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

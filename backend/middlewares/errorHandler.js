import logger from '../config/logger.js';

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log the error - safely access request properties for Express 5.x compatibility
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.originalUrl || req.url || 'unknown',
        method: req.method || 'unknown',
        ip: req.ip || req.socket?.remoteAddress || 'unknown',
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Prepare error response
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
    };

    // Add validation errors if present
    if (err.errors) {
        errorResponse.errors = err.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

export default errorHandler;

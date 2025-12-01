import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import logger from './config/logger.js';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';

import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

import errorHandler, { notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to database and cloudinary
connectDB();
connectCloudinary();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middlewares
// Helmet - Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS - Restrict to specific origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request from origin:', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken'],
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB NoSQL Injection Prevention
// app.use(mongoSanitize({
//     replaceWith: '_',
// }));

// Cookie parser (for HttpOnly cookies)
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// General rate limiting for all API routes
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Healthcare API',
        version: '1.0.0',
        endpoints: {
            user: '/api/user',
            doctor: '/api/doctor',
            admin: '/api/admin',
        },
    });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Centralized error handling - must be last middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
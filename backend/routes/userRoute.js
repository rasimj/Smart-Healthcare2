import express from 'express';
import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    refreshAccessToken
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateBooking,
    validateCancellation
} from '../middlewares/validateInput.js';

const userRouter = express.Router();

// Public routes with rate limiting
/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 */
userRouter.post('/register', authLimiter, validateRegister, registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User Login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
userRouter.post('/login', authLimiter, validateLogin, loginUser);
userRouter.post('/refresh', authLimiter, refreshAccessToken);

// Protected routes
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', upload.single('image'), authUser, validateProfileUpdate, updateProfile);
userRouter.post('/book-appointment', authUser, validateBooking, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, validateCancellation, cancelAppointment);

export default userRouter;
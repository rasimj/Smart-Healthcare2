import express from 'express';
import {
    addDoctor,
    loginAdmin,
    allDoctors,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard
} from '../controllers/adminController.js';
import { changeAvailability } from '../controllers/doctorController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { authLimiter, uploadLimiter } from '../middlewares/rateLimiter.js';
import { validateDoctorCreation, validateCancellation } from '../middlewares/validateInput.js';

const adminRouter = express.Router();

// Public route with rate limiting
/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Admin]
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
 *       401:
 *         description: Invalid credentials
 */
adminRouter.post('/login', authLimiter, loginAdmin);

// Protected routes
/**
 * @swagger
 * /admin/add-doctor:
 *   post:
 *     summary: Add a new doctor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               speciality:
 *                 type: string
 *               degree:
 *                 type: string
 *               experience:
 *                 type: string
 *               about:
 *                 type: string
 *               fees:
 *                 type: number
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Doctor added successfully
 *       401:
 *         description: Unauthorized
 */
adminRouter.post('/add-doctor', authAdmin, uploadLimiter, upload.single('image'), addDoctor);
adminRouter.post('/all-doctors', authAdmin, allDoctors);
adminRouter.post('/change-availability', authAdmin, changeAvailability);
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.get('/dashboard', authAdmin, adminDashboard);
adminRouter.post('/cancel-appointment', authAdmin, validateCancellation, appointmentCancel);

export default adminRouter;
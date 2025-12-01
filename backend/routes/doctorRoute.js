import express from "express";
import { doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
import { authLimiter } from '../middlewares/rateLimiter.js';

const doctorRouter = express.Router()

// Public routes
/**
 * @swagger
 * /doctor/list:
 *   get:
 *     summary: Get all doctors list
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of doctors
 */
doctorRouter.get('/list', doctorList)

/**
 * @swagger
 * /doctor/login:
 *   post:
 *     summary: Doctor Login
 *     tags: [Doctor]
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
doctorRouter.post('/login', authLimiter, loginDoctor)

// Protected routes
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor)

doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)



export default doctorRouter
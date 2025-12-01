import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import mongoose from 'mongoose';
import logger from '../config/logger.js';

//API Register user
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            logger.warn('Registration attempt with existing email', { email });
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        // Generate access token (15 minutes)
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate refresh token (7 days)
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info('User registered successfully', { userId: user._id, email: user.email });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            accessToken
        });

    } catch (error) {
        logger.error('Error in registerUser', { error: error.message, stack: error.stack });
        next(error);
    }
};

// API for user login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.warn('Login attempt with incorrect password', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate access token (15 minutes)
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate refresh token (7 days)
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info('User logged in successfully', { userId: user._id, email: user.email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken
        });

    } catch (error) {
        logger.error('Error in loginUser', { error: error.message, stack: error.stack });
        next(error);
    }
};

//API to get user profile data
const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password');

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({ success: true, userData });

    } catch (error) {
        logger.error('Error in getProfile', { error: error.message, userId: req.userId });
        next(error);
    }
};

// API to update user profile
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address, dob, gender } = req.body;
        const userId = req.userId; // From auth middleware
        const imageFile = req.file;

        // Safely parse address
        let parsedAddress = {};
        try {
            parsedAddress = address ? JSON.parse(address) : {};
        } catch (err) {
            logger.warn('Invalid address format in profile update', { userId });
            return res.status(400).json({
                success: false,
                message: 'Invalid address format'
            });
        }

        // Update user data
        const updateData = { name, phone, address: parsedAddress, dob, gender };

        // Upload image to Cloudinary if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: 'image',
                transformation: [
                    { width: 500, height: 500, crop: 'fill' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            });
            updateData.image = imageUpload.secure_url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info('Profile updated successfully', { userId });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            userData: updatedUser
        });

    } catch (error) {
        logger.error('Error in updateProfile', { error: error.message, userId: req.userId });
        next(error);
    }
};

//API to book appointment
const bookAppointment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { docId, slotDate, slotTime } = req.body;
        const userId = req.userId; // From auth middleware

        // Find doctor within transaction
        const docData = await doctorModel.findById(docId).select('-password').session(session);

        if (!docData) {
            await session.abortTransaction();
            logger.warn('Booking attempt with invalid doctor ID', { docId, userId });
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        if (!docData.available) {
            await session.abortTransaction();
            logger.warn('Booking attempt with unavailable doctor', { docId, userId });
            return res.status(400).json({
                success: false,
                message: 'Doctor not available'
            });
        }

        // Get current slots
        let slots_booked = docData.slots_booked || {};

        // Check slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                await session.abortTransaction();
                logger.warn('Booking attempt for already booked slot', { docId, slotDate, slotTime });
                return res.status(409).json({
                    success: false,
                    message: 'Slot not available'
                });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        // Get user data
        const userData = await userModel.findById(userId).select('-password').session(session);

        if (!userData) {
            await session.abortTransaction();
            logger.error('User not found during booking', { userId });
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create appointment data
        const appointmentData = {
            userId,
            docId,
            userData: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: userData.address
            },
            docData: {
                name: docData.name,
                speciality: docData.speciality,
                degree: docData.degree,
                image: docData.image,
                fees: docData.fees
            },
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        // Create appointment and update doctor slots within transaction
        const newAppointment = await appointmentModel.create([appointmentData], { session });
        await doctorModel.findByIdAndUpdate(
            docId,
            { slots_booked },
            { session, new: true }
        );

        // Commit transaction
        await session.commitTransaction();

        logger.info('Appointment booked successfully', {
            appointmentId: newAppointment[0]._id,
            userId,
            docId,
            slotDate,
            slotTime
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointmentId: newAppointment[0]._id
        });

    } catch (error) {
        await session.abortTransaction();
        logger.error('Error in bookAppointment', {
            error: error.message,
            stack: error.stack,
            userId: req.userId
        });
        next(error);
    } finally {
        session.endSession();
    }
};

//API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res, next) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });

        res.status(200).json({ success: true, appointments });
    } catch (error) {
        logger.error('Error in listAppointment', { error: error.message, userId: req.userId });
        next(error);
    }
};

const cancelAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            logger.warn('Cancel attempt for non-existent appointment', { appointmentId, userId });
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check
        if (appointmentData.userId.toString() !== userId.toString()) {
            logger.warn('Unauthorized cancel attempt', { appointmentId, userId });
            return res.status(403).json({
                success: false,
                message: 'Unauthorized action'
            });
        }

        // Check if already cancelled
        if (appointmentData.cancelled) {
            return res.status(400).json({
                success: false,
                message: 'Appointment already cancelled'
            });
        }

        // Check if already completed
        if (appointmentData.isCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed appointment'
            });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // Release the slot
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
            doctorData.slots_booked[slotDate] = doctorData.slots_booked[slotDate].filter(
                (time) => time !== slotTime
            );
            await doctorModel.findByIdAndUpdate(docId, { slots_booked: doctorData.slots_booked });
        }

        logger.info('Appointment cancelled successfully', { appointmentId, userId });

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });

    } catch (error) {
        logger.error('Error in cancelAppointment', { error: error.message, userId: req.userId });
        next(error);
    }
};


// API to refresh access token using refresh token
const refreshAccessToken = async (req, res, next) => {
    try {
        // Get refresh token from HttpOnly cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            logger.warn('Refresh attempt without token');
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Generate new access token
        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        logger.info('Access token refreshed', { userId: decoded.id });

        res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        logger.error('Error in refreshAccessToken', { error: error.message });

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired. Please login again.',
                expired: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        next(error);
    }
};


export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, refreshAccessToken }

import { body, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// User registration validation
export const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),

    handleValidationErrors
];

// User login validation
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .escape(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),

    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other', 'Not Selected']).withMessage('Invalid gender'),

    body('dob')
        .optional()
        .isDate().withMessage('Invalid date of birth'),

    handleValidationErrors
];

// Appointment booking validation
export const validateBooking = [
    body('docId')
        .notEmpty().withMessage('Doctor ID is required')
        .isMongoId().withMessage('Invalid doctor ID'),

    body('slotDate')
        .notEmpty().withMessage('Slot date is required')
        .matches(/^\d{1,2}_\d{1,2}_\d{4}$/).withMessage('Invalid date format. Use DD_MM_YYYY'),

    body('slotTime')
        .notEmpty().withMessage('Slot time is required')
        .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).withMessage('Invalid time format. Use HH:MM AM/PM'),

    handleValidationErrors
];

// Doctor creation validation (admin)
export const validateDoctorCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

    body('speciality')
        .trim()
        .notEmpty().withMessage('Speciality is required')
        .escape(),

    body('degree')
        .trim()
        .notEmpty().withMessage('Degree is required')
        .escape(),

    body('experience')
        .trim()
        .notEmpty().withMessage('Experience is required')
        .escape(),

    body('about')
        .trim()
        .notEmpty().withMessage('About is required')
        .isLength({ min: 50, max: 500 }).withMessage('About must be between 50 and 500 characters')
        .escape(),

    body('fees')
        .notEmpty().withMessage('Fees is required')
        .isInt({ min: 0 }).withMessage('Fees must be a positive number'),

    body('address')
        .notEmpty().withMessage('Address is required')
        .isJSON().withMessage('Address must be valid JSON'),

    handleValidationErrors
];

// Appointment cancellation validation
export const validateCancellation = [
    body('appointmentId')
        .notEmpty().withMessage('Appointment ID is required')
        .isMongoId().withMessage('Invalid appointment ID'),

    handleValidationErrors
];

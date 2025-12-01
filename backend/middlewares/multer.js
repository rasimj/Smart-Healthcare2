import multer from 'multer';

// Configure storage
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

// File filter - only allow images
const fileFilter = (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter,
});

export default upload;
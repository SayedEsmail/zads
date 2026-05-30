const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for general images (avatars, etc.)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for certificates (degrees, verification documents)
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/certificates';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

// File filter for certificates (images and PDFs)
const certificateFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and image files are allowed for certificates!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const certificateUpload = multer({
    storage: certificateStorage,
    fileFilter: certificateFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload Image Controller
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/uploads/images/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
            url: imageUrl,
            filename: req.file.filename
        }
    });
};

// Upload Certificate Controller
exports.uploadCertificate = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No certificate file uploaded'
        });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const fileUrl = `${baseUrl}/uploads/certificates/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: {
            url: fileUrl,
            filename: req.file.filename
        }
    });
};

exports.uploadMiddleware = upload.single('image');
exports.certificateMiddleware = certificateUpload.single('certificate');

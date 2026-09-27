const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');

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

// Upload Certificate Controller - Assigns ownership server-side to authenticated teacher
exports.uploadCertificate = async (req, res, next) => {
    let filePath;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No certificate file uploaded'
            });
        }

        const teacherId = req.user.teacher?.id;
        if (!teacherId) {
            return res.status(403).json({
                success: false,
                message: 'Only teachers can upload certificates'
            });
        }

        const safeFilename = path.basename(req.file.filename);
        filePath = req.file.path;
        const relativeUrl = `/uploads/certificates/${safeFilename}`;

        // Directly link to the teacher and invalidate previous verification
        await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                certificateUrl: relativeUrl,
                isVerified: false,
                verifiedAt: null,
                verifiedBy: null,
                verificationNotes: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Certificate uploaded and assigned successfully',
            data: {
                url: relativeUrl,
                filename: safeFilename
            }
        });
    } catch (error) {
        if (filePath) {
            fs.unlink(filePath, unlinkError => {
                if (unlinkError && unlinkError.code !== 'ENOENT') {
                    console.error('[UPLOAD] Failed to remove unassigned certificate:', unlinkError.message);
                }
            });
        }
        next(error);
    }
};

// Authorized Certificate Retrieval (Teacher owner or Admin only)
exports.getCertificate = async (req, res, next) => {
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.resolve('public/uploads/certificates', safeFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Certificate file not found'
            });
        }

        // Admins can view any certificate
        if (req.user.userType === 'admin') {
            return res.sendFile(filePath);
        }

        // Teachers can only view their own certificate based on DB record
        if (req.user.userType === 'teacher' && req.user.teacher) {
            const currentTeacher = await prisma.teacher.findUnique({
                where: { id: req.user.teacher.id },
                select: { certificateUrl: true }
            });
            if (currentTeacher?.certificateUrl) {
                const currentFilename = path.basename(currentTeacher.certificateUrl.split('?')[0]);
                if (currentFilename === safeFilename) {
                    return res.sendFile(filePath);
                }
            }
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to view this document.'
        });
    } catch (error) {
        next(error);
    }
};

exports.uploadMiddleware = upload.single('image');
exports.certificateMiddleware = certificateUpload.single('certificate');

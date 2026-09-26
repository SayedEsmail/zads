const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { auth, isTeacher } = require('../middlewares/auth');

// POST /api/upload/image
// Protected route - only authenticated users can upload
router.post('/image', auth, uploadController.uploadMiddleware, uploadController.uploadImage);

// POST /api/upload/certificate
// Check role before multer writes a certificate to disk.
router.post('/certificate', auth, isTeacher, uploadController.certificateMiddleware, uploadController.uploadCertificate);

module.exports = router;

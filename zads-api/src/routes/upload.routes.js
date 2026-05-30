const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { auth } = require('../middlewares/auth');

// POST /api/upload/image
// Protected route - only authenticated users can upload
router.post('/image', auth, uploadController.uploadMiddleware, uploadController.uploadImage);

// POST /api/upload/certificate
// Protected route - only authenticated users can upload
router.post('/certificate', auth, uploadController.certificateMiddleware, uploadController.uploadCertificate);

module.exports = router;

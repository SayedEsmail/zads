const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { auth } = require('../middlewares/auth');

// POST /api/upload/image
// Protected route - only authenticated users can upload
router.post('/image', auth, uploadController.uploadMiddleware, uploadController.uploadImage);

module.exports = router;

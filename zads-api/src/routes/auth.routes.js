const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
    registerTeacherSchema,
    registerParentSchema,
    loginSchema,
    updateProfileSchema
} = require('../utils/validators');

// Register teacher
router.post(
    '/register/teacher',
    validate(registerTeacherSchema),
    authController.registerTeacher
);

// Register parent
router.post(
    '/register/parent',
    validate(registerParentSchema),
    authController.registerParent
);

// Login
router.post(
    '/login',
    validate(loginSchema),
    authController.login
);

// Get current user profile (protected)
router.get('/profile', auth, authController.getProfile);

// Update current user profile (protected)
router.put(
    '/profile',
    auth,
    validate(updateProfileSchema),
    authController.updateProfile
);

// Change password endpoint alias (protected)
router.put(
    '/change-password',
    auth,
    validate(updateProfileSchema),
    authController.updateProfile
);

// Update FCM token (protected)
router.post('/fcm-token', auth, authController.updateFcmToken);

module.exports = router;

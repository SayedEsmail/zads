const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { auth, isAdmin } = require('../middlewares/auth');

// Setup routes
router.post('/register-token', auth, notificationsController.registerToken);
router.post('/send', auth, isAdmin, notificationsController.sendNotification);

module.exports = router;

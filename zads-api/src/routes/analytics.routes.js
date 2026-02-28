const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const { optionalAuth } = require('../middlewares/auth');

// We use optionalAuth here so parents who are logged in will have their parentId recorded.
// Unauthenticated users (guests) can still click, so it records teacherId without parentId.
router.post('/whatsapp-click', optionalAuth, controller.logWhatsAppClick);

module.exports = router;

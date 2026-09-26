const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const { optionalAuth } = require('../middlewares/auth');

// Full planned funnel endpoints:
// Attribution, profile view, search outcome, and authorized contact clicks
router.post('/event', optionalAuth, controller.logEvent);
router.post('/attribution', optionalAuth, controller.logAttribution);
router.post('/contact-click', optionalAuth, controller.logAuthorizedContactClick);

// Legacy backwards compatibility:
router.post('/whatsapp-click', optionalAuth, controller.logWhatsAppClick);

module.exports = router;

const express = require('express');
const router = express.Router();
const parentsController = require('../controllers/parents.controller');
const { auth, isParent } = require('../middlewares/auth');

// Protected routes (parent only)
router.get('/me', auth, isParent, parentsController.getMyProfile);
router.put('/me', auth, isParent, parentsController.updateProfile);

// Children management
router.get('/me/children', auth, isParent, parentsController.getChildren);
router.post('/me/children', auth, isParent, parentsController.addChild);
router.put('/me/children/:childId', auth, isParent, parentsController.updateChild);
router.delete('/me/children/:childId', auth, isParent, parentsController.deleteChild);

module.exports = router;

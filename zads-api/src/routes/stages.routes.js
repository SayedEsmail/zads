const express = require('express');
const router = express.Router();
const stagesController = require('../controllers/stages.controller');
const { auth, isAdmin } = require('../middlewares/auth');

// Public
router.get('/', stagesController.getAllStages);

// Admin only
router.post('/', auth, isAdmin, stagesController.createStage);
router.put('/:id', auth, isAdmin, stagesController.updateStage);

module.exports = router;

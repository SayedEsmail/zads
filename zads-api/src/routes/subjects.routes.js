const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjects.controller');
const { auth, isAdmin } = require('../middlewares/auth');

// Public
router.get('/', subjectsController.getAllSubjects);

// Admin only
router.post('/', auth, isAdmin, subjectsController.createSubject);
router.put('/:id', auth, isAdmin, subjectsController.updateSubject);

module.exports = router;

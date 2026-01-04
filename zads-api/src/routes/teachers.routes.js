const express = require('express');
const router = express.Router();
const teachersController = require('../controllers/teachers.controller');
const { auth, isTeacher } = require('../middlewares/auth');

// Protected routes (teacher only) - MUST be before /:id
router.get('/me', auth, isTeacher, teachersController.getMyProfile);
router.put('/me', auth, isTeacher, teachersController.updateTeacher);
router.get('/me/stats', auth, isTeacher, teachersController.getMyStats);
router.get('/me/subjects', auth, isTeacher, teachersController.getMySubjects);
router.post('/me/subjects', auth, isTeacher, teachersController.addSubject);
router.put('/me/subjects/:teacherSubjectId', auth, isTeacher, teachersController.updateSubject);

// Public routes
router.get('/search', teachersController.searchTeachers);
router.get('/', teachersController.searchTeachers);
router.get('/:id', teachersController.getTeacherById);

module.exports = router;

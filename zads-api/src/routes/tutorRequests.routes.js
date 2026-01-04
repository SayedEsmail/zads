const express = require('express');
const router = express.Router();
const controller = require('../controllers/tutorRequests.controller');
const { auth, isParent, isTeacher } = require('../middlewares/auth');

// Teachers can browse tutor requests
router.get('/', auth, isTeacher, controller.getTutorRequests);

// Parent routes
router.post('/', auth, isParent, controller.createRequest);
router.get('/my', auth, isParent, controller.getMyRequests);
router.patch('/:requestId/close', auth, isParent, controller.closeRequest);
router.put('/:requestId', auth, isParent, controller.updateRequest);
router.delete('/:requestId', auth, isParent, controller.deleteRequest);

module.exports = router;

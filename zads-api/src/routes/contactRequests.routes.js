const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactRequests.controller');
const { auth, isParent, isTeacher } = require('../middlewares/auth');

// Parent routes
router.post('/', auth, isParent, controller.createRequest);
router.get('/my', auth, isParent, controller.getMyRequestsAsParent);
router.patch('/:requestId', auth, isParent, controller.updateRequestMessage);
router.patch('/parent/:requestId/status', auth, isParent, controller.updateRequestStatusAsParent);

// Teacher routes
router.post('/teacher', auth, isTeacher, controller.createRequestAsTeacher);
router.get('/incoming', auth, isTeacher, controller.getIncomingRequests);
router.patch('/:requestId/status', auth, isTeacher, controller.updateRequestStatus);

module.exports = router;

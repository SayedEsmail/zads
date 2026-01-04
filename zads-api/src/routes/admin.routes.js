const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth, isAdmin } = require('../middlewares/auth');

// All admin routes require auth + admin role
router.use(auth, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Teachers management
router.get('/teachers', adminController.getAllTeachers);

// Parents management
router.get('/parents', adminController.getAllParents);

// User status management
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Stats
router.get('/stats/contacts', adminController.getContactStats);

module.exports = router;

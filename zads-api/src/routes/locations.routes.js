const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');

// Public routes - no auth needed
router.get('/governorates', locationsController.getGovernorates);
router.get('/governorates/:governorateId/cities', locationsController.getCitiesByGovernorate);
router.get('/cities', locationsController.getCitiesByGovernorate);
router.get('/cities/:cityId/areas', locationsController.getAreasByCity);
router.get('/areas', locationsController.getAreasByCity);
router.get('/hierarchy', locationsController.getFullHierarchy);

module.exports = router;

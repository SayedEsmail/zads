const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const { auth, isParent } = require('../middlewares/auth');

// All routes require parent auth
router.use(auth, isParent);

router.get('/', favoritesController.getMyFavorites);
router.post('/', favoritesController.addFavorite);
router.delete('/:teacherId', favoritesController.removeFavorite);

module.exports = router;

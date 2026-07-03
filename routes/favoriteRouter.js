const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

router.post('/add', isLoggedIn, favoriteController.addFavorite);
router.post('/delete', isLoggedIn, favoriteController.deleteFavorite);

module.exports = router;

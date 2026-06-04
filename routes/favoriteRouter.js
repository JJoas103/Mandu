const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.post('/add', favoriteController.postAdd);
router.post('/remove', favoriteController.postRemove);

module.exports = router;

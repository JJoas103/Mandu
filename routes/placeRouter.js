const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

router.get('/place/info/:place_name', placeController.getPlaceInfo);

module.exports = router
const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

router.get('/search', placeController.getSearch);
router.get('/:area_cd', placeController.getPlaceInfo);

module.exports = router;

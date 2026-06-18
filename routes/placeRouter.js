const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

router.get('/search', placeController.getSearch);
// 한산한 장소와 모든 장소 조회 조건 추가함
router.get('/quiet', placeController.getQuietPlaces);
router.get('/', placeController.getAllPlaces);
router.get('/:area_cd', placeController.getPlaceInfo);

module.exports = router;

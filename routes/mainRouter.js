const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/', mainController.getMain);
router.get('/api/congestion', mainController.getCongestion);

module.exports = router;

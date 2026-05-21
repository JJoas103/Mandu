const express = require('express');
const router = express.Router();
const meetingService = require('../services/meetingService');
const mainController = require('../controllers/mainController');

router.get('/', mainController.getMain);

module.exports = router;

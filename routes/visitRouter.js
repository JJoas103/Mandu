const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

router.post('/verify', visitController.postVerify);

module.exports = router;

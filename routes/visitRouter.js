const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

router.post('/verify', isLoggedIn, visitController.postVerify);

module.exports = router;

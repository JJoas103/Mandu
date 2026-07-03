const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// 댓글 작성
router.post('/write', isLoggedIn, commentController.createComment);

// 댓글 삭제
router.post('/delete', isLoggedIn, commentController.deleteComment);

module.exports = router;

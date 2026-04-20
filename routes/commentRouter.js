const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/write/:boardId', commentController.createComment);//댓글 작성
router.post('/delete', commentController.deleteComment);//댓글 삭제

module.exports = router;

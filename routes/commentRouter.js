const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');

// 댓글 작성
router.post('/write', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("로그인이 필요합니다");
    try {
        const { content, boardId, onModel } = req.body;
        await commentService.createComment({
            content,
            author: req.user.id,
            board: boardId,
            onModel
        });
        res.redirect(`/${onModel.toLowerCase()}/info/${boardId}`);
    } catch (error) {
        next(error);
    }
});

// 댓글 삭제
router.post('/delete', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("로그인이 필요합니다");
    try {
        const { commentId, boardId, onModel } = req.body;
        await commentService.deleteComment(commentId, req.user.id);
        res.redirect(`/${onModel.toLowerCase()}/info/${boardId}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

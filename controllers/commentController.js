const commentService = require('../services/commentService');
const Notification = require('../models/Notification');
const Feed = require('../models/Feed');
const Meeting = require('../models/Meeting');

// 댓글 작성
const createComment = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("로그인이 필요합니다");
    try {
        const { content, boardId, onModel } = req.body;
        await commentService.createComment({
            content,
            author: req.user.id,
            board: boardId,
            onModel
        });

        // 게시글 작성자에게 알림 보내기
        let board;
        if (onModel === 'Feed') {
            board = await Feed.findById(boardId);
        } else if (onModel === 'Meeting') {
            board = await Meeting.findById(boardId);
        }

        if (board && board.author && board.author.toString() !== req.user.id) {
            const boardTitle = board.title || board.locationTag || '게시글';
            await Notification.create({
                user: board.author,
                type: 'comment',
                message: `[${boardTitle}]에 새로운 댓글이 달렸어요.`,
                relatedLink: `/${onModel.toLowerCase()}/info/${boardId}`
            });
        }

        res.redirect(`/${onModel.toLowerCase()}/info/${boardId}`);
    } catch (error) {
        next(error);
    }
};

// 댓글 삭제
const deleteComment = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("로그인이 필요합니다");
    try {
        const { commentId, boardId, onModel } = req.body;
        await commentService.deleteComment(commentId, req.user.id);
        res.redirect(`/${onModel.toLowerCase()}/info/${boardId}`);
    } catch (error) {
        next(error);
    }
};

module.exports = { createComment, deleteComment };

const Comment = require('../models/Comment');

// 댓글 작성
const createComment = async ({ content, author, board, onModel }) => {
    const newComment = new Comment({
        content,
        author,
        board,
        onModel: onModel || 'Meeting'
    });
    await newComment.save();
    return newComment;
};

// 특정 게시글의 댓글 목록 가져오기
const getCommentsByBoardId = async (boardId, page = 1) => {
    const limit = 5;
    const skip = (page - 1) * limit;
    
    const totalComments = await Comment.countDocuments({ board: boardId });
    const totalCommentPages = Math.max(1, Math.ceil(totalComments / limit));

    const comments = await Comment.find({ board: boardId })
        .populate('author', 'nickname profileImage avatar_emoji manner_score')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return { comments, totalCommentPages, currentCommentPage: page };
};

// 댓글 삭제
const deleteComment = async (commentId, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("댓글을 찾을 수 없습니다");
    
    // 작성자 확인
    if (comment.author.toString() !== userId.toString()) {
        throw new Error("삭제 권한이 없습니다");
    }

    await Comment.findByIdAndDelete(commentId);
};

module.exports = { createComment, getCommentsByBoardId, deleteComment };

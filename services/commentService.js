const Comment = require('../models/Comment');

//댓글 작성
const createComment = async({content, author, board}) => {
    const newComment = new Comment({
        content,
        author,
        board
    });
    await newComment.save();//DB에 저장
}

//특정 게시글에 작성한 댓글들 가져오기
const getCommentByBoardId = async (boardId, page) =>{
    const limit = 5;
    const skip = (page - 1) * limit;
    const totalComments = await Comment.countDocuments({ board: boardId });
    const totalCommentPages = Math.max(1, Math.ceil(totalComments / limit));

    const comments = await Comment.find({board : boardId})
                        .populate('author', 'name')
                        .sort({createdAt: -1})
                        .skip(skip)
                        .limit(limit);
    //board의 속성값이 특정 게시글 id와 일치하는 댓글들 가져오기
    return {comments, totalCommentPages, currentCommentPage: page};
}

//특정 게시글 삭제
const deleteComment = async (commentId) =>{
    await Comment.findByIdAndDelete(commentId);//DB에서 해당 댓글 삭제
}

module.exports = {createComment, getCommentByBoardId, deleteComment};
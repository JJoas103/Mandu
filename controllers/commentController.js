const commentService = require("../services/commentService");

//댓글 작성
const createComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  const { content } = req.body; //댓글 내용
  const author = req.user.id; //댓글 작성자(=로그인한 회원)
  const board = req.params.boardId; //댓글은 단 게시글

  try {
    await commentService.createComment({ content, author, board }); //DB에 댓글 저장
  } catch (error) {
    next(error);
  }
  res.redirect(`/feed/info/${board}`); //댓글을 작성한 게시글로 리다이렉트
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  const { commentId, boardId } = req.body;
  try {
    await commentService.deleteComment(commentId); //DB에서 특정 댓글 삭제
    res.redirect(`/feed/info/${boardId}`); //삭제된 댓글이 있던 게시글로 리다이렉트
  } catch (error) {
    next(error);
  }
};

module.exports = { createComment, deleteComment };

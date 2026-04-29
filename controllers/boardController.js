const boardService = require("../services/boardService");
const commentService = require("../services/commentService");

// 게시글 작성 페이지
const getWrite = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  res.render("feed/write");
};

// 게시글 처리
const postWrite = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  const { title, content, category } = req.body;
  try {
    await boardService.createBoard({
      title,
      content,
      author: req.user.id,
      category,
      file: req.file,
    });
    res.redirect(`/meeting/list/${category}`);
  } catch (error) {
    next(error);
  }
};

//게시글 목록 페이지
const getList = async (req, res) => {
  const category = req.params.category;
  const page = parseInt(req.query.page) || 1; //페이지 정보, 디폴트 1페이지

  try {
    const { boards, totalPages, currentPage } = await boardService.getBoardByCategory(category, page);
    res.render("meeting/list", { boards, totalPages, currentPage, category });
  } catch (error) {
    next(error);
  }
};

//특정 게시글 조회
const getBoardInfo = async (req, res) => {
  const boardId = req.params.boardId;
  const board = await boardService.getBoardById(boardId);

  //댓글 페이징
  const commentPage = parseInt(req.query.commentPage) || 1;
  try {
    const { comments, totalCommentPages, currentCommentPage } = await commentService.getCommentByBoardId(boardId, commentPage);
    //특정 게시글에 단 댓글들 가져오기
    res.render("meeting/info", { board, comments, totalCommentPages, currentCommentPage });
  } catch (error) {
    next(error);
  }
};

//특정 게시글 수정페이지
const getBoardModify = async (req, res, next) => {
  try {
    const boardId = req.params.boardId;
    const modifyBoard = await boardService.getBoardById(boardId);
    console.log(modifyBoard);
    res.render("meeting/modify", { board: modifyBoard });
  } catch (error) {
    next(error);
  }
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
};
//특정 게시글 수정 처리
const postBoardModify = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  try {
    const boardId = req.params.boardId; //특정 게시글 id
    const { title, content } = req.body; //수정할 제목과 내용
    await boardService.updateBoard(boardId, { title, content }); //DB에서 특정 게시글 수정
    res.redirect(`/meeting/info/${boardId}`);
  } catch (error) {
    next(error);
  }
};

//특정 게시글 삭제 페이지
const getBoardDelete = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  res.render("meeting/delete", { boardId: req.params.boardId });
};

//특정 게시글 삭제 처리
const postBoardDelete = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/member/login");
  }
  try {
    await boardService.deleteBoard(req.params.boardId); //DB에서 삭제 처리
    res.redirect("/"); //삭제 후 메인 페이지
  } catch (error) {
    next(error);
  }
};

//최신글 6개 가져오기
const getMainBoards = async (req, res, next) => {
  try {
    const mainBoards = await boardService.getMainBoards();
    res.render("index", { title: "메인페이지", mainBoards });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWrite,
  postWrite,
  getList,
  getBoardInfo,
  getBoardModify,
  postBoardModify,
  getBoardDelete,
  postBoardDelete,
  getMainBoards,
};

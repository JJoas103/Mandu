const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const {uploadBoard} = require('../config/upload');

//게시글 작성 페이지
router.get('/write', boardController.getWrite);

//게시글 작성 처리
router.post('/write', uploadBoard.single('uploadFile'), boardController.postWrite);

//게시글 목록 페이지
router.get('/list/:category', boardController.getList);

//특정 게시글 상세 페이지
router.get('/info/:boardId', boardController.getBoardInfo);

//특정 게시글 수정 페이지
router.get('/modify/:boardId', uploadBoard.single('uploadFile'), boardController.getBoardModify);

//특정 게시글 처리
router.post('/modify/:boardId', boardController.postBoardModify);

//특정 게시글 삭제 페이지
router.get('/delete/:boardId', boardController.getBoardDelete);

//특정 게시글 삭제 처리
router.post('/delete/:boardId', boardController.postBoardDelete);

module.exports = router;
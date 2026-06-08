const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const passport = require('../config/passport');
const { uploadBoard } = require('../config/upload');
const { joinValidationRules, validate } = require('../middlewares/validationMiddleware');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// 모임 목록
router.get("/list", meetingController.getList);

// 모임 작성
router.get("/write", isLoggedIn, meetingController.getWrite);
router.post("/write", isLoggedIn, uploadBoard.single('imageUrl'), meetingController.postWrite);

// 모임 상세
router.get("/info/:id", meetingController.getInfo);

// 모임 수정
router.get("/modify/:id", isLoggedIn, meetingController.getModify);
router.post("/modify/:id", uploadBoard.single('imageUrl'), meetingController.postModify);

// 모임 삭제
router.post("/delete/:id", meetingController.postDelete);

// 모임 참가
router.post("/join/:id", isLoggedIn, meetingController.postJoin);

module.exports = router;

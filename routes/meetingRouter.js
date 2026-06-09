const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const passport = require('../config/passport');
const { uploadBoard } = require('../config/upload');
const { joinValidationRules, validate } = require('../middlewares/validationMiddleware');
// 모임 목록
router.get("/list", meetingController.getList);

// 모임 작성
router.get("/write", meetingController.getWrite);
router.post("/write", uploadBoard.single('imageUrl'), meetingController.postWrite);

// 모임 상세
router.get("/info/:id", meetingController.getInfo);

// 모임 수정
router.get("/modify/:id", meetingController.getModify);
router.post("/modify/:id", uploadBoard.single('imageUrl'), meetingController.postModify);

// 모임 삭제
router.post("/delete/:id", meetingController.postDelete);

// 모임 참여
router.post("/join/:id", meetingController.postJoin);

module.exports = router;

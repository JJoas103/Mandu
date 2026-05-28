const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const passport = require('../config/passport');
const { uploadProfile } = require('../config/upload');
const { joinValidationRules, validate } = require('../middlewares/validationMiddleware');
// 모임 목록
router.get("/list", meetingController.getList);

// 모임 작성
router.get("/write", meetingController.getWrite);
router.post("/write", uploadProfile.single('imageUrl'), meetingController.postWrite);

// 모임 상세
router.get("/info/:id", meetingController.getInfo);

// 모임 수정
router.get("/modify/:id", meetingController.getModify);
router.post("/modify/:id", meetingController.postModify);

// 모임 삭제
router.post("/delete/:id", meetingController.postDelete);

module.exports = router;

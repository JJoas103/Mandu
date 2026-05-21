const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");

// 모임 목록
router.get("/list", meetingController.getList);

// 모임 작성
router.get("/write", meetingController.getWrite);
router.post("/write", meetingController.postWrite);

// 모임 상세
router.get("/info/:id", meetingController.getInfo);

// 모임 수정
router.get("/modify/:id", meetingController.getModify);
router.post("/modify/:id", meetingController.postModify);

// 모임 삭제
router.post("/delete/:id", meetingController.postDelete);

module.exports = router;

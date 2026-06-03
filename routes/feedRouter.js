const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedControllers");
const { uploadBoard } = require("../config/upload"); // 제보 이미지 업로드용

// 제보 목록
router.get("/list", feedController.getList);

// 제보 작성
router.get("/write", feedController.getWrite);
router.post("/write", uploadBoard.single("uploadFile"), feedController.postWrite);

// 제보 상세
router.get("/info/:id", feedController.getInfo);

// 제보 수정
router.get("/modify/:id", feedController.getModify);
router.post("/modify/:id", uploadBoard.single("uploadFile"), feedController.postModify);

// 제보 삭제
router.post("/delete/:id", feedController.postDelete);

module.exports = router;

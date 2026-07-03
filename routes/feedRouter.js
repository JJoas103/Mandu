const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedControllers");
const { uploadBoard } = require("../config/upload"); // 제보 이미지 업로드용
const { isLoggedIn } = require("../middlewares/authMiddleware");

// 제보 목록
router.get("/list", feedController.getList);

// 제보 작성
router.get("/write", isLoggedIn, feedController.getWrite);
router.post("/write", isLoggedIn, uploadBoard.single("uploadFile"), feedController.postWrite);

// 제보 상세
router.get("/info/:id", feedController.getInfo);

// 제보 수정
router.get("/modify/:id", isLoggedIn, feedController.getModify);
router.post("/modify/:id", isLoggedIn, uploadBoard.single("uploadFile"), feedController.postModify);

// 제보 삭제
router.post("/delete/:id", isLoggedIn, feedController.postDelete);

// 제보 추천
router.post("/like/:id", isLoggedIn, feedController.postLike);

module.exports = router;

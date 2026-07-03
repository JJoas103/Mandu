const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/authController");

// 구글
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", authController.googleCallback);

// 네이버
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback", authController.naverCallback);

module.exports = router;

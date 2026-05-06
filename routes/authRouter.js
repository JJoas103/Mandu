const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// 구글
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: "/member/login",
    successRedirect: "/",
}));

// 네이버
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback", passport.authenticate("naver", {
    failureRedirect: "/member/login",
    successRedirect: "/",
}));

module.exports = router;

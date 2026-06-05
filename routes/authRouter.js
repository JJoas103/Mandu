const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// 구글
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            if (info && info.type === 'social_new') {
                req.session.socialData = info.socialData;
                return res.redirect("/member/social-join");
            }
            return res.redirect("/member/login");
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/");
        });
    })(req, res, next);
});

// 네이버
router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback", (req, res, next) => {
    passport.authenticate("naver", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            if (info && info.type === 'social_new') {
                req.session.socialData = info.socialData;
                return res.redirect("/member/social-join");
            }
            return res.redirect("/member/login");
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/");
        });
    })(req, res, next);
});

module.exports = router;

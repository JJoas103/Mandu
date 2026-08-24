const express = require("express");
const router = express.Router();
const passport = require("../../config/passport");
const { uploadProfile } = require("../../config/upload");
const userService = require("../../services/userService");

// React(SPA)가 떠 있는 프론트엔드 주소
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 클라이언트(React)에 보낼 필드만 골라 내려주기
function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    nickname: user.nickname,
    city: user.city,
    address: user.address,
    avatar_emoji: user.avatar_emoji,
    manner_score: user.manner_score,
    badges: user.badges,
    profileImage: user.profileImage,
    provider: user.provider,
    congestion_alert: user.congestion_alert,
    notify_start: user.notify_start,
    notify_end: user.notify_end,
    alert_meeting: user.alert_meeting,
    alert_comment: user.alert_comment,
    alert_badge: user.alert_badge,
    alert_marketing: user.alert_marketing,
  };
}

// 현재 세션 로그인 여부 확인. 로그인 안 되어 있는 것도 정상 응답(에러 아님) - user: null로 내려주기
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ success: true, user: toPublicUser(req.user) });
  }
  res.json({ success: true, user: null });
});

// 로컬 로그인 (JSON 응답용)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: (info && info.message) || "이메일 또는 비밀번호가 일치하지 않습니다" });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ success: true, user: toPublicUser(user) });
    });
  })(req, res, next);
});

// 로그아웃 (JSON 응답용)
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

// 구글/네이버 소셜 로그인 (React용).
function socialApiCallback(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        if (info && info.type === "social_new") {
          // 신규 소셜 사용자: 세션에 정보 저장 후 온보딩 페이지로
          req.session.socialData = info.socialData;
          return res.redirect(`${FRONTEND_URL}/member/social-join`);
        }
        return res.redirect(`${FRONTEND_URL}/member/login`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.redirect(FRONTEND_URL);
      });
    })(req, res, next);
  };
}

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", socialApiCallback("google"));

router.get("/naver", passport.authenticate("naver"));
router.get("/naver/callback", socialApiCallback("naver"));

// 소셜 온보딩 페이지(SocialJoin)가 세션에 저장된 socialData(이메일/닉네임)를 불러올 때 사용
// 세션에 값이 없으면(직접 URL로 들어왔거나 이미 가입 완료된 경우) socialData: null을 내려준다.
router.get("/social-data", (req, res) => {
  res.json({ success: true, socialData: req.session.socialData || null });
});

// 소셜 가입 완료 처리 (기존 POST /member/social-join(userController.postSocialJoin)와 동일 로직 - JSON 응답용)
router.post("/social-join", uploadProfile.single("uploadFile"), async (req, res, next) => {
  if (!req.session.socialData) {
    return res.status(400).json({ success: false, message: "세션이 만료되었습니다. 다시 로그인해주세요." });
  }

  try {
    const { email, provider } = req.session.socialData;
    const { nickname, city, address, avatar_emoji } = req.body;

    const user = await userService.createSocialUser({
      email,
      nickname,
      city,
      address,
      avatar_emoji,
      provider,
      uploadFile: req.file,
    });

    delete req.session.socialData;

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ success: true, user: toPublicUser(user) });
    });
  } catch (error) {
    if (error.code === "NICKNAME_DUPLICATE") {
      return res.status(400).json({ success: false, fieldErrors: { nickname: error.message } });
    }
    next(error);
  }
});

module.exports = router;

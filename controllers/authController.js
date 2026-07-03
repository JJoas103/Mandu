const passport = require('../config/passport');

// 소셜 로그인 콜백 처리 (구글/네이버 공통)
const socialCallback = (strategy) => (req, res, next) => {
    passport.authenticate(strategy, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            if (info && info.type === 'social_new') {
                // 신규 소셜 사용자: 세션에 정보 저장 후 온보딩 페이지로
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
};

module.exports = {
    googleCallback: socialCallback('google'),
    naverCallback: socialCallback('naver'),
};

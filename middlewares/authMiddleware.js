// 로그인하지 않았으면, login 페이지로..
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    // fetch로 호출하는 AJAX 요청은 JSON으로 응답 (프론트에서 confirm 처리)
    if (req.accepts(['html', 'json']) === 'json') {
        return res.status(401).json({ success: false, authRequired: true, message: '로그인이 필요합니다.' });
    }

    // 일반 페이지 이동/폼 제출은 confirm으로 안내 후 이동 여부 선택
    res.send(`
        <script>
            if (confirm('로그인이 필요합니다.')) {
                location.href = '/member/login';
            } else {
                history.back();
            }
        </script>
    `);
};

module.exports = { isLoggedIn };
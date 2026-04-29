const userService = require('../services/userService');

//# 회원 가입 페이지
const getJoin = (req, res) => {
    res.render('member/join', {
        errors: {}
    });
};
//# 회원가입 처리
const postJoin = async (req, res, next) => {
    try {
        const { email, password, nickname, city, avatar_emoji } = req.body;
        //회원 생성
        await userService.createUser({ email, password, nickname, city, avatar_emoji });
        console.log('회원가입 요청', { email, password, nickname, city, avatar_emoji })
        res.redirect('/');
        
    } catch (error) {
        return next(error);
    }
}
//# 이메일 중복확인
const checkEmail = async (req, res, next) => {
    const { email } = req.query;
    try {
        const avalilabe = await userService.checkEmail(email);
        console.log(avalilabe);
        res.json({ avalilabe });//db에 해당 email이 있으면 false, 없으면 true
    } catch (error) {
        next(error);
    }
}
//# 로그인 페이지
const getLogin = (req, res) => {
    const messages = req.session.messages || [];
    const errorMessage = messages[messages.length - 1] || null;
    req.session.messages = [];
    res.render('member/login', { errorMessage });
};

//로그아웃 처리
const logout = (req, res, next) => {
    req.logout((error) => {
        if(error) {
            return next(error);
        }
        res.redirect('/member/login');
    })
}
module.exports = { getJoin, postJoin, checkEmail, getLogin, logout };
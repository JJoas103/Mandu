const express = require('express');
const router = express.Router();
const { joinValidationRules, validate } = require('../middlewares/validationMiddleware');
const userController = require('../controllers/userController');
const passport = require('../config/passport');

//회원가입 페이지
router.get('/join', userController.getJoin);
//회원가입 처리
router.post('/join', joinValidationRules, validate('/member/join'), userController.postJoin);
///이메일 중복확인
router.get('/check-email', userController.checkEmail);
//로그인 페이지
router.get('/login', userController.getLogin);
//로그인 처리
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/member/login',
    failureMessage: true
}));
//로그아웃 처리
router.get('/logout', userController.logout);

module.exports = router;
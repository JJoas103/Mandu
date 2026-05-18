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

//마이페이지
router.get('/info', userController.getMemberInfo);

//정보 수정
router.get('/modify', userController.getModify);
router.post('/modify', userController.postModify);

//찜·알림 설정
router.get('/favorites', userController.getFavorites);
router.post('/notify-settings', userController.postNotifySettings);

//회원 탈퇴
router.get('/delete', userController.getDelete);
router.post('/delete', userController.postDelete);

//지도 가져오기
router.get('/map', userController.getMapView);
module.exports = router;
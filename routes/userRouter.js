const express = require('express');
const router = express.Router();
const { joinValidationRules, validate } = require('../middlewares/validationMiddleware');
const userController = require('../controllers/userController');
const passport = require('../config/passport');
const { uploadProfile } = require('../config/upload');

// 회원가입
router.get('/join', userController.getJoin);
router.post('/join', uploadProfile.single('uploadFile'), joinValidationRules, validate, userController.postJoin);

// 소셜 가입 온보딩
router.get('/social-join', userController.getSocialJoin);
router.post('/social-join', uploadProfile.single('uploadFile'), userController.postSocialJoin);

// 이메일 중복 확인
router.get('/check-email', userController.checkEmail);

// 로그인
router.get('/login', userController.getLogin);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/member/login',
    failureMessage: true
}));

// 로그아웃
router.get('/logout', userController.logout);

//마이페이지
router.get('/info', userController.getMemberInfo);

// 회원 수정
router.get('/modify', userController.getModify);
router.post('/modify', uploadProfile.single('uploadFile'), userController.postModify);

//회원 탈퇴
router.get('/favorites', userController.getFavorites);
router.post('/notify-settings', userController.postNotifySettings);

// 알림 관리
router.patch('/notifications/read', userController.markNotificationsAsRead);
router.delete('/notifications', userController.deleteNotifications);
router.delete('/notifications/read', userController.deleteReadNotifications);

//회원 탈퇴
router.get('/delete', userController.getDelete);
router.post('/delete', userController.postDelete);

module.exports = router;

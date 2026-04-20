const express = require('express');
const router = express.Router();
const {joinValidationRules, validate} = require('../middlewares/validationMiddleware')
const userController = require('../controllers/userController');
const passport = require('../config/passport');
const {uploadProfile} = require('../config/upload');

//회원가입 페이지
router.get('/join', userController.getJoin);

//회원가입 처리
router.post('/join', uploadProfile.single('uploadFile'), joinValidationRules, validate,
 userController.postJoin);

//로그인 페이지
router.get('/login', userController.getLogin);

//로그인 처리
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',           //로그인 성공 시 메인페이지로
    failureRedirect: '/user/login', //로그인 실패 시 로그인페이지로
    failureMessage: true            //실패 메시지를 세션에 저장
}));

//로그아웃 처리
router.get('/logout', userController.logout);

//마이페이지
router.get('/info', userController.getInfo);

//회원수정 페이지
router.get('/modify', userController.getModify);

//회원수정 처리
router.post('/modify', uploadProfile.single('uploadFile'), userController.postModify);

//회원탈퇴 페이지
router.get('/delete', userController.getDelete);

//회원탈퇴 처리
router.post('/delete', userController.postDelete);

//이메일 중복확인
router.get('/check-email', userController.checkEmail);

module.exports = router;
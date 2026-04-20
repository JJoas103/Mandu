const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;//인증 방법 정의 - 로컬
const GoogleStrategy = require('passport-google-oauth20').Strategy;//인증 방법 정의 - 구글
const NaverStrategy = require('passport-naver-v2').Strategy;//인증 방법 정의 - 네이버
const bcrypt = require('bcrypt');
const userService = require('../services/userService');

// 로컬 인증 방법 정의
passport.use(new LocalStrategy({
    usernameField: 'email',     //로그인 시 사용할 아이디 파라미터
    passwordField: 'password'   //로그인 시 사용할 비밀번호 파라미터
}, async (email, password, done) => {
    try {
        //DB에서 해당 아이디를 가진 객체가 있는지 확인
        const user = await userService.findUserByEmail(email);
        if(!user){
            return done(null, false, {message : '이메일 또는 비밀번호가 일치하지 않습니다'});
            //null: 서버에러가 아님 / false: 인증 실패
        }
        //비밀번호 일치확인
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return done(null, false, {message : '비밀번호가 일치하지 않습니다'});
        }
        done(null, user);// 인증 성공 사용자 객체 반환

    } catch (error) {
        return done(error);//서버 오류(DB 연결 실패 등)
    }
}));

// 구글 로그인
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'

}, async(accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;//인증된 회원의 이메일
        let user = await userService.findUserByEmail(email);
        if(user){
            return done(null, user);
        }

        //새로운회원 생성
        const newUser = await userService.createSocialUser(
            {
                email,
                name: profile.displayName, //구글에서 제공하는 이름
                profileImage : profile.photos[0].value, //구글에서 제공하는 프로필 사진
                address : '',
                provider: 'google'
            }
        );
        //로그인
        return done(null, newUser);
    } catch(error){
        return done(error);
    }
}));

//네이버 로그인 
passport.use(new NaverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: '/auth/naver/callback'

}, async(accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.email;//인증된 회원의 이메일

        //기존 이메일로 가입된 회원이 dB에 있으면 로그인
        let user = await userService.findUserByEmail(email);
        if(user){
            return done(null, user);
        }

        //네이버에서 가져온 회원의 정보로 새로운 회원 생성
        const newUser = await userService.createSocialUser(
            {
                email,
                name: profile.name, //네이버에서 제공하는 이름
                profileImage : profile.profileImage, //네이버에서 제공하는 프로필 사진
                address : '',
                provider: 'naver'
            }
        );
        //로그인
        return done(null, newUser);
    } catch(error){
        return done(error);
    }
}));
// 세션에 인증된 사용자 정보 쿠키에 저장
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// 쿠키에 저장된 정보를 토대로 DB에서 인증된 사용자인지 확인
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }   
});

module.exports = passport;
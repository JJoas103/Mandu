const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;//인증 방법 정의 - 로컬
const bcrypt = require('bcrypt');
const userService = require('../services/userService');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async(email, password, done) => {
    try {
        const user = await userService.findUserByEmail(email);
        if(!user){
            return done(null, false, {message : '이메일 또는 비밀번호가 일치하지 않습니다'});
            //null: 서버에러가 아님 / false : 인증 실패
        }
        //비밀번호 일치 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return done(null, false, {message : '비밀번호가 일치하지 않습니다'});
        }
        done(null, user);
    } catch (error) {
        return done(error);//서버 오류(DB 연결 실패 등)
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
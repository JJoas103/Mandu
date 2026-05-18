//env 불러오기
require('dotenv').config();

//패키지 불러오기
const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const session = require('express-session');
const passport = require('./config/passport');
//app 생성
const app = express();

//라우터/미들웨어 import
const userRouter = require('./routes/userRouter');
const mainRouter = require('./routes/mainRouter');

const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware')
//DB 연결
connectDB();

//뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

//미들웨어
app.use(express.static(path.join(__dirname, 'public')));//정적 파일
app.use(express.urlencoded({extended : true}));

//세션 설정
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
}));
app.use(passport.initialize()); //passport 초기화 미들웨어
app.use(passport.session()); //세션 미들웨어 추가

//전역 변수 추가
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

//라우터 등록
app.get('/', (req, res) => {
    res.render('index', {title : '메인페이지'});
});
app.use('/', mainRouter);
app.use('/member', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);
//서버 시작
app.listen(3000, () => {
    console.log('서버 실행 중: http://localhost:3000');
});

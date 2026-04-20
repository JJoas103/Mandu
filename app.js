// 환경변수 불러오기
require('dotenv').config();


//패키지 불러오기
const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const session = require('express-session');
const passport = require('./config/passport');
//app 생성
const app = express();

//라우터 import
const mainRouter = require('./routes/mainRouter');
const userRouter = require('./routes/userRouter');
const boardRouter = require('./routes/boardRouter');
const commentRouter = require('./routes/commentRouter');
const authRouter = require('./routes/authRouter');
const {errorHandler, notFoundHandler} = require('./middlewares/errorMiddleware');
//DB 연결
connectDB();

//뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 미들웨어
app.use(express.static(path.join(__dirname, 'public'))); //정적파일
app.use(express.urlencoded({extended: true}));//form 데이터 파싱

//세션 설정
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: false,
}));
//secret: 세션 쿠키 암호화할 때 쓰는 키, 
//resave : 세션이 변경되지 않아도 저장할지 여부
//saveUninitialized: 세션이 저장되기 전에 초기화할지 여부
app.use(passport.initialize());//passport초기화 미들웨어
app.use(passport.session());//세션 미들웨어 추가

//전역변수 추가
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})
//라우터 등록
app.use('/', mainRouter);
app.use('/user', userRouter);
app.use('/board', boardRouter);
app.use('/comment', commentRouter);
app.use('/auth', authRouter);

app.use(notFoundHandler);//404에러 핸들러 등록
app.use(errorHandler);//에러 핸들러 등록

//서버 시작
app.listen(3000, () => {
    console.log(`3000번 포트에서 서버가 실행중입니다.`);
});
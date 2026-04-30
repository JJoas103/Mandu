<<<<<<< HEAD
// 환경변수 불러오기
require("dotenv").config();

//패키지 불러오기
const express = require("express");
const path = require("path");
const connectDB = require("./config/database");
const session = require("express-session");
const passport = require("./config/passport");
//app 생성
const app = express();

//라우터 import
const mainRouter = require("./routes/mainRouter");
const userRouter = require("./routes/userRouter");
const meetingRouter = require("./routes/meetingRouter");
const feedRouter = require("./routes/feedRouter");
const commentRouter = require("./routes/commentRouter");
const authRouter = require("./routes/authRouter");
const { errorHandler, notFoundHandler } = require("./middlewares/errorMiddleware");
=======
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

const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware')
>>>>>>> 5dfe5ec01bf7e474f6493cdbb5da4f87d14f29cd
//DB 연결
connectDB();

//뷰 엔진 설정
<<<<<<< HEAD
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 미들웨어
app.use(express.static(path.join(__dirname, "public"))); //정적파일
app.use(express.urlencoded({ extended: true })); //form 데이터 파싱

//세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
//secret: 세션 쿠키 암호화할 때 쓰는 키,
//resave : 세션이 변경되지 않아도 저장할지 여부
//saveUninitialized: 세션이 저장되기 전에 초기화할지 여부
app.use(passport.initialize()); //passport초기화 미들웨어
app.use(passport.session()); //세션 미들웨어 추가

//전역변수 추가
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// 현재 사이트 위치(헤더)
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

//라우터 등록
app.use("/", mainRouter);
app.use("/member", userRouter);
app.use("/meeting", meetingRouter);
// app.use("/feed", feedRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);

app.use(notFoundHandler); //404에러 핸들러 등록
app.use(errorHandler); //에러 핸들러 등록

//서버 시작
app.listen(3000, () => {
  console.log(`3000번 포트에서 서버가 실행중입니다.`);
=======
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
app.use('/member', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);
//서버 시작
app.listen(3000, () => {
    console.log('서버 실행 중: http://localhost:3000');
>>>>>>> 5dfe5ec01bf7e474f6493cdbb5da4f87d14f29cd
});

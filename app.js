require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/database");
const session = require("express-session");
const passport = require("./config/passport");
const { errorHandler, notFoundHandler } = require("./middlewares/errorMiddleware");

const app = express();

// DB 연결
connectDB();

// chrome 개발자 도구 켰을 때 뜨는 오류 무시
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).end(); // 콘텐트 없음으로 정상 응답 처리
});

// 뷰 엔진
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 미들웨어
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);

// 패스포트
app.use(passport.initialize());
app.use(passport.session());

const Notification = require("./models/Notification");

// 전역 변수
app.use(async (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.unreadNotificationCount = 0;

  if (req.user) {
    try {
      const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
      res.locals.unreadNotificationCount = count;
    } catch (err) {
      console.error("알림 개수 조회 에러:", err);
    }
  }
  next();
});

// 라우터
const mainRouter = require("./routes/mainRouter");
const userRouter = require("./routes/userRouter");
const meetingRouter = require("./routes/meetingRouter");
const feedRouter = require("./routes/feedRouter");
const commentRouter = require("./routes/commentRouter");
const authRouter = require("./routes/authRouter");
const placeRouter = require("./routes/placeRouter");
const favoriteRouter = require("./routes/favoriteRouter");
const visitRouter = require("./routes/visitRouter");

app.use("/", mainRouter);
app.use("/member", userRouter);
app.use("/meeting", meetingRouter);
app.use("/feed", feedRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);
app.use("/place", placeRouter);
app.use("/favorite", favoriteRouter);
app.use("/visit", visitRouter);

// 에러 핸들링
app.use(notFoundHandler);
app.use(errorHandler);

// 포트 설정 (로그를 더 자세히 찍도록 변경)
const PORT = 3000;
app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`오류: ${PORT}번 포트가 이미 사용 중입니다.`);
    } else {
      console.error("서버 시작 중 오류 발생:", err);
    }
  });

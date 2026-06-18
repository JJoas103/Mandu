# 모여봄 (MoyeoBom) — 서울 모임 플랫폼

> 실시간 혼잡도 기반으로 서울 곳곳의 여유로운 동네에서 모임을 만들고 찾을 수 있는 플랫폼

## 📁 폴더 구조

```
모여봄/
├── app.js                      ← 메인 서버 실행 파일
├── config/                     ← 데이터베이스 및 환경 설정
├── controllers/                ← 비즈니스 로직 처리 (MVC의 C)
├── models/                     ← MongoDB 스키마 정의 (MVC의 M)
├── routes/                     ← URL 경로 라우팅 설정
├── services/                   ← 외부 API 연동 및 복잡한 DB 로직
├── public/                     ← 정적 리소스 파일
│   ├── css/
│   │   └── style.css           ← 공통 스타일 (모여봄 그린 테마)
│   ├── images/
│   └── js/
└── views/                      ← EJS 뷰 템플릿 (MVC의 V)
    ├── index.ejs               ← ① 지도 탐색 (메인)
    ├── place/                  ← 장소 관련 템플릿
    │   ├── place_info.ejs      ← ① 장소 상세 (혼잡도·주차·화장실·날씨)
    │   └── search_result.ejs   ← ① 장소 검색 결과 및 전체/한산한 명소 리스트
    ├── meeting/                ← 모임 관련 템플릿
    │   ├── list.ejs            ← ② 모임 게시판 목록
    │   ├── info.ejs            ← ② 모임 상세 + 참여 신청
    │   ├── write.ejs           ← ② 모임 만들기
    │   └── modify.ejs          ← ② 모임 수정
    ├── feed/                   ← 제보 피드 관련 템플릿
    │   ├── list.ejs            ← ③ 실시간 제보 피드
    │   ├── info.ejs            ← ③ 제보 상세 + 댓글
    │   ├── write.ejs           ← ③ 제보 작성 (장소 태그 필수)
    │   └── modify.ejs          ← ③ 제보 수정
    ├── member/                 ← 회원 관련 템플릿
    │   ├── login.ejs           ← 로그인
    │   ├── join.ejs            ← 회원가입
    │   ├── info.ejs            ← ④ 마이페이지 (매너점수·배지·방문기록)
    │   ├── modify.ejs          ← ④ 회원정보 수정
    │   └── favorites.ejs       ← ④ 찜한 장소 · 알림 설정
    └── partials/               ← 공통 헤더, 푸터 템플릿
```

## 🗂️ 흐름도 ↔ 파일 매핑

| 흐름도 항목 | 담당 파일 |
| ----------------------------------------------------- | ----------------------------------------------------- |
| 지도 페이지 (실시간 지역 정보, 모임 마커, 핫플 랭킹) | `views/index.ejs` |
| 장소 목록 (검색 결과, 전체 장소, 한산한 명소) | `views/place/search_result.ejs` |
| 장소 상세 (혼잡도, 주차장/화장실 API, 해당 장소 모임) | `views/place/place_info.ejs` |
| 모임 게시판 / 모임 만들기 | `views/meeting/list.ejs`, `views/meeting/write.ejs` |
| 모임 상세 / 참여 신청·수락 | `views/meeting/info.ejs` |
| 제보 피드 (목록) / 제보하기 | `views/feed/list.ejs`, `views/feed/write.ejs`, `views/feed/info.ejs` |
| 마이페이지 (방문기록 인증, 획득 배지, 매너 점수) | `views/member/info.ejs` |
| 참여중인 모임 / 내가 제보한 글 / 방문한 지역 | `views/member/info.ejs` 내 섹션 |
| 찜한 장소 · 알림 설정 | `views/member/favorites.ejs` |
| 로그인 / 회원가입 | `views/member/login.ejs`, `views/member/join.ejs` |

## 🗄️ DB 테이블(컬렉션) ↔ 라우터/모델 매핑

| DB 컬렉션 (Models)        | 연결되는 주요 라우터 (Routes)                                      |
| ------------------------- | ------------------------------------------------------------------ |
| `users`                   | `userRouter.js`, `authRouter.js`                                    |
| `places`                  | `mainRouter.js`, `placeRouter.js`, `meetingRouter.js` (장소 선택)   |
| `place_congestion_hourly` | `placeRouter.js` (시간대 혼잡도 데이터)                               |
| `place_infra`             | `placeRouter.js` (주차/화장실/교통/날씨 정보)                       |
| `nearby_spots`            | `placeRouter.js` (주변 편의시설)                                  |
| `meetings`                | `meetingRouter.js`, `placeRouter.js` (해당 장소 모임)              |
| `meeting_participants`    | `meetingRouter.js` (참여자 목록, 참여 신청)                       |
| `meeting_tags`            | `meetingRouter.js` (태그 정보)                                     |
| `feeds`                   | `feedRouter.js`                                                    |
| `feed_comments`           | `commentRouter.js`                                                 |
| `feed_reactions`          | `feedRouter.js` (👍 버튼)                                         |
| `visit_logs`              | `visitRouter.js` (방문 인증), `userRouter.js` (방문 기록)           |
| `badges`, `user_badges`   | `userRouter.js` (획득 배지 목록)                                   |

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **View Engine**: EJS (Embedded JavaScript templates)
- **Frontend**: Vanilla HTML/JS, Bootstrap 5.3.3 (CDN)
- **Design/Font**: Noto Sans KR (가독성 최적화)

## 🎨 컬러 테마

`public/css/style.css` 상단 `:root`에 CSS 변수로 정의:

- `--brand: #1d9e75` (메인 초록)
- `--brand-700: #16a34a` (진한 초록)
- `--brand-50: #e6f9f4` (배경 초록)
- 혼잡도: 여유=초록, 보통=노랑, 혼잡=빨강

## 🚀 실행 방법 (Getting Started)

1. **패키지 설치**
   ```bash
   npm install
   ```
2. **환경변수 설정**
   * 프로젝트 루트에 `.env` 파일을 생성하고 필요한 API 키 및 DB 접속 정보를 입력하세요. (카카오 지도 API 키 등)
3. **서버 실행**
   ```bash
   npm start
   # 또는 node app.js
   ```
4. **접속**
   * 브라우저에서 `http://localhost:3000` (설정된 포트)에 접속합니다.

## 📌 주요 라우트 (Routes) 구조

### View (화면 렌더링) 라우트
- `GET /` : 메인 지도 화면
- `GET /place` : 전체 장소 리스트 보기
- `GET /place/quiet` : 한산한 명소 리스트 보기
- `GET /place/search?keyword=...` : 장소 검색 및 결과 리스트
- `GET /place/:area_cd` : 장소 상세 정보
- `GET /meeting` : 모임 리스트
- `GET /feed` : 제보 피드 리스트
- `GET /member/info` : 마이페이지

### API (데이터 처리) 라우트
- `POST /auth/join`, `/auth/login` : 회원가입 / 로그인
- `POST /user/modify`, `/user/delete` : 회원정보 수정 / 탈퇴
- `POST /meeting/write`, `/meeting/modify`, `/meeting/delete` : 모임 C/U/D
- `POST /meeting/join` : 모임 참여 신청
- `POST /feed/write`, `/feed/modify`, `/feed/delete` : 제보 C/U/D
- `POST /comment/write` : 댓글 작성
- `POST /visit/verify` : GPS 방문 인증
- `POST /favorite/add`, `/favorite/delete` : 장소 찜 C/D

---

© 2026 모여봄 · 1조 프로젝트

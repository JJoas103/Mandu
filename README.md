# 모여봄 (MoyeoBom) — 서울 모임 플랫폼

> 실시간 혼잡도 데이터를 기반으로 서울 곳곳의 여유로운 동네를 탐색하고, 사람들과의 만남을 주도하는 위치 기반 모임 플랫폼

---

## 🛠️ 기술 스택 (Tech Stack)

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **View Engine**: EJS, Bootstrap 5.3.3
- **Authentication**: Passport.js (Local, Google OAuth 2.0, Naver OAuth 2.0), bcrypt, express-session
- **Real-Time Features**: Socket.IO (양방향 실시간 통신 및 지역 기반 룸 시스템)
- **Background Tasks**: node-cron (실시간 데이터 스케줄러)
- **File Uploads**: Multer (프로필 5MB, 게시글 20MB 제한 및 MIME 타입 검증)
- **External API**: axios (카카오 로컬 API, 서울시 실시간 공공데이터 API, wttr.in 날씨 API)
- **Validation**: express-validator

---

## 🚀 실행 방법 (Getting Started)

1. **패키지 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정 (`.env`)**
   `.env_sample`을 참고하여 프로젝트 루트에 `.env` 파일을 생성합니다.
   - `PORT`, `MONGO_URI`, `SESSION_SECRET`
   - 카카오 REST API 키, 서울시 공공데이터 API 키 등 외부 서비스 키
   - 소셜 로그인 (Google, Naver) Client ID & Secret

3. **초기 시드 데이터 주입 (DB 초기화)**
   ```bash
   npm run seed:places   # 기준이 되는 서울 지역 장소 데이터 주입
   npm run seed:parking  # 기본 주차장 데이터 주입
   ```

4. **서버 실행**
   ```bash
   npm run start  # 일반 실행
   npm run dev    # 개발 모드 (nodemon)
   ```

---

## 📁 디렉터리 구조 및 파일 맵핑 (Folder Structure)

```text
모여봄/
├── app.js               # Express 메인 진입점 (미들웨어, 세션, Socket.IO 바인딩)
├── config/              # DB 연결, Multer 업로드 설정, Passport 전략 구성
├── controllers/         # MVC의 C: 라우트별 비즈니스 로직 및 뷰 렌더링 응답 처리
├── middlewares/         # 인증(auth), 에러 처리(error), 유효성 검사(validation)
├── models/              # Mongoose DB 스키마 (16개 컬렉션)
├── routes/              # 엔드포인트 라우팅 처리
├── schedulers/          # 백그라운드 작업 (예: 혼잡도 자동 갱신)
├── services/            # 핵심 로직 분리 및 외부 API(서울시, 카카오 등) 통신
└── views/               # EJS 뷰 템플릿 화면
    ├── error/           # 400, 404, 500 에러 처리 화면
    ├── feed/            # 제보 게시판 (목록, 작성, 상세조회)
    ├── meeting/         # 모임 게시판 (목록, 개설, 상세조회)
    ├── member/          # 회원 관리 (로그인, 가입, 마이페이지, 찜/알림 설정)
    ├── place/           # 장소 탐색 (검색 결과 리스트, 장소 상세 인포)
    └── index.ejs        # 메인 홈페이지 (지도 및 통합 랭킹)
```

---

## 🗄️ 데이터베이스 스키마 (DB Models)

총 16개의 정교한 컬렉션 구조로 이루어져 있습니다.

| 모델 (Model) | 설명 (Description) |
|---|---|
| **User** | 계정, 지역 설정, 세부 알림 수신 동의 여부, **매너 점수 및 랭크** 관리 |
| **Activity** | **매너 점수 변동의 핵심 추적 테이블**. 회원의 모든 행동 이력(모임 참여, 제보, 방문 등)을 기록 |
| **Meeting** | 모임 개설 정보. 장소 태그, 모집 상태, 인원수 제한, 참여자 배열 관리 |
| **Feed** | 실시간 지역 제보. 카테고리별 제보 내용, 이미지, 받은 추천(Like) 관리 |
| **Comment** | 다형성 참조(`onModel`)를 사용하여 모임, 피드, 일반 게시판 어디든 달릴 수 있는 범용 댓글 모델 |
| **Favorite** | 회원의 장소 찜하기 기록 (중복 방지 인덱스 처리) |
| **VisitLog** | 1일 1회 GPS 기반 장소 방문 인증을 통한 점수 획득 기록 |
| **Notification** | 알림(좋아요, 댓글, 시스템 등) 내역 보관, 읽음 처리, 관련 링크 매핑 |
| **Place** | 플랫폼 내 관리 대상 지역. 기온, 하늘상태, 습도 등 날씨 정보 및 기본 정보 캐싱 |
| **Congestion** | **실시간 혼잡도 및 예측 데이터**. (시간대별 예상 인구 및 인구 급증률 데이터 보관) |
| **ParkingInfo** | 카카오 및 공공데이터를 가공한 해당 지역 주차장 실시간 현황 |
| 기타 | `Board`(자유게시판), `FeedComment`(피드 전용 댓글), `PlaceInfra`(주변 인프라), `NearBySpots`(주변 상권), `ToiletInfo`(화장실 인프라) |

---

## 🔄 핵심 비즈니스 로직 및 기능 작동 흐름 (Core Logic)

### 1. 매너 점수 시스템 (Gamification & Manner Score)
모든 활동은 사용자의 신뢰도를 나타내는 `manner_score` (기본 50점, 최대 100점)에 영향을 미치며, `Activity` 모델에 로그가 남습니다.
- **+5.0점**: 모임 개설 (`POST /meeting/write`)
- **+2.0점**: 모임 참가 (`POST /meeting/join`), 장소 방문 GPS 인증 (`POST /visit/verify`), 내 제보가 추천을 받음 (`POST /feed/like`)
- **+1.0점**: 제보 작성 (`POST /feed/write`), 장소 찜하기 (`POST /favorite/add`)
- **+0.5점**: 댓글 작성 (`POST /comment/write`)

### 2. 정교한 실시간 알림 시스템 (Socket.IO & DB Notification)
사용자에게 피로감을 주지 않도록 **지역 기반 필터링**을 거칩니다.
- **모임 및 제보 발생 시**: 현재 시간 기준 -1~+2시간 이내에 **같은 동네(District)**에 위치한 모임의 방장/참가자, 그리고 해당 동네 알림을 켜둔 유저를 선별합니다.
- 선별된 유저에게는 DB 상에 `Notification` 객체를 즉시 생성하고, **Socket.IO** 개인 룸(`user:{id}`)과 지역 룸을 통해 실시간으로 알림 팝업 및 피드 데이터를 브로드캐스트합니다. (새로고침 없이 UI 반영)

### 3. 외부 API 및 백그라운드 스케줄러 자동화 (node-cron)
- **`congestionScheduler.js`**: `node-cron`을 활용하여 매 10분(`*/10 * * * *`)마다 서울시 공공데이터 API를 호출하고, MongoDB의 혼잡도 컬렉션을 최신 상태로 갱신 및 캐싱합니다.
- **카카오 로컬 인프라 연결**: 장소 상세 페이지(`views/place/place_info.ejs`) 접근 시 `kakaoLocalService`가 가동하여 좌표 기반 주변 주차장, 화장실, 대중교통 위치를 병합하여 제공합니다.

---

## 📌 주요 라우팅 요약 (Routes Mapping)

- **`mainRouter` (`/`)**: 메인 페이지 렌더링. 실시간 혼잡도 급증 장소, 한산한 장소 추천, 최신 모임 통합 제공.
- **`authRouter` / `userRouter` (`/member`, `/auth`)**: 
  - 로컬 회원가입(유효성 검사 적용), 소셜 로그인 콜백, 마이페이지(활동 내역 및 뱃지 표시).
  - 유저 세부 알림 설정(`POST /notify-settings`) 및 알림 읽음/삭제 처리.
- **`placeRouter` (`/place`)**: 전체 장소 보기, 한산한 곳만 모아보기(`/quiet`), 장소 검색, 특정 지역 통합 상세 정보 제공.
- **`meetingRouter` (`/meeting`)**: 모임 개설, 참여/취소, 목록 필터링(마감 임박, 여유 지역 필터 지원).
- **`feedRouter` (`/feed`)**: 제보 등록(GPS 마커 지정), 조회, 실시간 좋아요(추천) 처리.
- **`favoriteRouter` / `visitRouter`**: 장소 찜하기 토글 및 프론트엔드 GPS 검증을 통한 방문 인증 API.

---

© 2026 모여봄 · 1조 프로젝트

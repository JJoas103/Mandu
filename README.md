# 모여봄 (MoyeoBom) — 서울 모임 플랫폼

> 실시간 혼잡도 기반으로 서울 곳곳의 여유로운 동네에서 모임을 만들고 찾을 수 있는 플랫폼

## 📁 폴더 구조

```
모여봄/
└── HTML/
    ├── css/
    │   └── style.css              ← 공통 스타일 (모여봄 그린 테마)
    ├── image/                      ← 이미지 파일 (자유 추가)
    │
    ├── index.html                  ← ① 지도 탐색 (메인)
    ├── place_info.html             ← ① 장소 상세 (혼잡도·주차·화장실·날씨)
    │
    ├── meeting_list.html           ← ② 모임 게시판 목록
    ├── meeting_info.html           ← ② 모임 상세 + 참여 신청
    ├── meeting_write.html          ← ② 모임 만들기
    ├── meeting_modify.html         ← ② 모임 수정
    ├── meeting_delete.html         ← ② 모임 삭제
    │
    ├── feed_list.html              ← ③ 실시간 제보 피드
    ├── feed_info.html              ← ③ 제보 상세 + 댓글
    ├── feed_write.html             ← ③ 제보 작성 (장소 태그 필수)
    ├── feed_modify.html            ← ③ 제보 수정
    ├── feed_delete.html            ← ③ 제보 삭제
    │
    ├── member_login.html           ← 로그인
    ├── member_join.html            ← 회원가입
    ├── member_info.html            ← ④ 마이페이지 (매너점수·배지·방문기록)
    ├── member_modify.html          ← ④ 회원정보 수정
    ├── member_delete.html          ← ④ 회원 탈퇴
    └── member_favorites.html       ← ④ 찜한 장소 · 알림 설정 (신규)
```

## 🗂️ 흐름도 ↔ 파일 매핑

<<<<<<< HEAD
| 흐름도 항목 | 담당 파일 |
| ----------------------------------------------------- | ----------------------------------------------------- |
| 지도 페이지 (실시간 지역 정보, 모임 마커, 핫플 랭킹) | `index.html` |
| 장소 상세 (혼잡도, 주차장/화장실 API, 해당 장소 모임) | `place_info.html` |
| 모임 게시판 / 모임 만들기 | `meeting_list.html`, `meeting_write.html` |
| 모임 상세 / 참여 신청·수락 | `meeting_info.html` |
| 제보 피드 (목록) / 제보하기 | `feed_list.html`, `feed_write.html`, `feed_info.html` |
| 마이페이지 (방문기록 인증, 획득 배지, 매너 점수) | `member_info.html` |
| 참여중인 모임 / 내가 제보한 글 / 방문한 지역 | `member_info.html` 내 섹션 |
| 찜한 장소 · 알림 설정 (신규) | `member_favorites.html` |
| 로그인 / 회원가입 | `member_login.html`, `member_join.html` |

## 🗄️ DB 테이블 ↔ 페이지 매핑

| DB 테이블                 | 연결되는 페이지                                                    |
| ------------------------- | ------------------------------------------------------------------ |
| `users`                   | `member_*.html` 전체                                               |
| `places`                  | `index.html`, `place_info.html`, `meeting_write.html` (select)     |
| `place_congestion_hourly` | `place_info.html` (시간대 혼잡도 바)                               |
| `place_infra`             | `place_info.html` (주차/화장실/교통/날씨 카드)                     |
| `nearby_spots`            | `place_info.html` (주변 편의시설)                                  |
| `meetings`                | `meeting_*.html` 전체, `place_info.html` (이 장소 모임)            |
| `meeting_participants`    | `meeting_info.html` (참여자 목록, 참여 신청)                       |
| `meeting_tags`            | `meeting_write.html`, `meeting_list.html` (태그 체크박스)          |
| `feeds`                   | `feed_*.html` 전체                                                 |
| `feed_comments`           | `feed_info.html` (댓글 섹션)                                       |
| `feed_reactions`          | `feed_info.html`, `feed_list.html` (👍 버튼)                       |
| `visit_logs`              | `place_info.html` (방문 인증 모달), `member_info.html` (방문 기록) |
| `badges`, `user_badges`   | `member_info.html` (획득 배지 그리드)                              |

=======
| 흐름도 항목 | 담당 파일 |
|---|---|
| 지도 페이지 (실시간 지역 정보, 모임 마커, 핫플 랭킹) | `index.html` |
| 장소 상세 (혼잡도, 주차장/화장실 API, 해당 장소 모임) | `place_info.html` |
| 모임 게시판 / 모임 만들기 | `meeting_list.html`, `meeting_write.html` |
| 모임 상세 / 참여 신청·수락 | `meeting_info.html` |
| 제보 피드 (목록) / 제보하기 | `feed_list.html`, `feed_write.html`, `feed_info.html` |
| 마이페이지 (방문기록 인증, 획득 배지, 매너 점수) | `member_info.html` |
| 참여중인 모임 / 내가 제보한 글 / 방문한 지역 | `member_info.html` 내 섹션 |
| 찜한 장소 · 알림 설정 (신규) | `member_favorites.html` |
| 로그인 / 회원가입 | `member_login.html`, `member_join.html` |

## 🗄️ DB 테이블 ↔ 페이지 매핑

| DB 테이블                 | 연결되는 페이지                                                    |
| ------------------------- | ------------------------------------------------------------------ |
| `users`                   | `member_*.html` 전체                                               |
| `places`                  | `index.html`, `place_info.html`, `meeting_write.html` (select)     |
| `place_congestion_hourly` | `place_info.html` (시간대 혼잡도 바)                               |
| `place_infra`             | `place_info.html` (주차/화장실/교통/날씨 카드)                     |
| `nearby_spots`            | `place_info.html` (주변 편의시설)                                  |
| `meetings`                | `meeting_*.html` 전체, `place_info.html` (이 장소 모임)            |
| `meeting_participants`    | `meeting_info.html` (참여자 목록, 참여 신청)                       |
| `meeting_tags`            | `meeting_write.html`, `meeting_list.html` (태그 체크박스)          |
| `feeds`                   | `feed_*.html` 전체                                                 |
| `feed_comments`           | `feed_info.html` (댓글 섹션)                                       |
| `feed_reactions`          | `feed_info.html`, `feed_list.html` (👍 버튼)                       |
| `visit_logs`              | `place_info.html` (방문 인증 모달), `member_info.html` (방문 기록) |
| `badges`, `user_badges`   | `member_info.html` (획득 배지 그리드)                              |

> > > > > > > 5dfe5ec01bf7e474f6493cdbb5da4f87d14f29cd

## 🛠️ 사용 기술 (예시 폴더와 동일)

- **Bootstrap 5.3.3** (CDN)
- **Noto Sans KR** — 가독성
- **Vanilla HTML/CSS** — 백엔드 프레임워크 독립적
- 각 페이지의 `<form action="/xxx/xxx">` 는 서버 연결 시 교체하면 됩니다

## 🎨 컬러 테마

`css/style.css` 상단 `:root`에 CSS 변수로 정의:

- `--brand: #1d9e75` (메인 초록)
- `--brand-700: #16a34a` (진한 초록)
- `--brand-50: #e6f9f4` (배경 초록)
- 혼잡도: 여유=초록, 보통=노랑, 혼잡=빨강

## 🚀 실행 방법

1. `HTML/index.html` 을 브라우저에서 바로 열기
2. 또는 VS Code Live Server 확장 사용 권장
3. 서버 연결 시: 각 `<form>` 의 `action` URL을 백엔드 라우트에 맞게 수정

## 📌 서버 연결 시 주요 POST 라우트

```
POST /member/join         ← 회원가입
POST /member/login        ← 로그인
POST /member/modify       ← 회원정보 수정
POST /member/delete       ← 회원 탈퇴

POST /meeting/write       ← 모임 생성
POST /meeting/modify      ← 모임 수정
POST /meeting/delete      ← 모임 삭제
POST /meeting/join        ← 모임 참여 신청

POST /feed/write          ← 제보 작성
POST /feed/modify         ← 제보 수정
POST /feed/delete         ← 제보 삭제
POST /feed/comment        ← 댓글 작성
POST /feed/react          ← 좋아요/고마워요

POST /visit/verify        ← GPS 방문 인증
POST /favorite/add        ← 장소 찜 추가
POST /favorite/delete     ← 장소 찜 제거
POST /member/notify-settings ← 알림 설정 저장
```

---

© 2026 모여봄 · 1조 프로젝트

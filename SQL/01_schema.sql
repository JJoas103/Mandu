-- =============================================================
-- 모여봄 (MoyeoBom) - 데이터베이스 스키마
-- DB 관계도(1조_DB_관계도.png)를 MySQL 기준으로 작성
-- =============================================================

-- 기존 DB 삭제 후 재생성 (개발 편의용)
DROP DATABASE IF EXISTS moyeobom;
CREATE DATABASE moyeobom DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE moyeobom;


-- =============================================================
-- 1. users (회원)
-- =============================================================
CREATE TABLE users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    nickname        VARCHAR(20)     NOT NULL COMMENT '닉네임',
    handle          VARCHAR(30)     NOT NULL UNIQUE COMMENT '@핸들',
    avatar_emoji    VARCHAR(8)      DEFAULT '😊' COMMENT '프로필 이모지',
    city            VARCHAR(20)     DEFAULT '서울' COMMENT '활동 지역',
    manner_score    DECIMAL(5,2)    DEFAULT 50.00 COMMENT '매너 점수 (0~100)',
    manner_rank     VARCHAR(20)     DEFAULT NULL COMMENT '예: 상위 15%',
    email           VARCHAR(100)    NOT NULL UNIQUE COMMENT '로그인 이메일',
    password        VARCHAR(255)    NOT NULL COMMENT '비밀번호 해시',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '회원 정보';


-- =============================================================
-- 2. places (장소)
-- =============================================================
CREATE TABLE places (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(50)     NOT NULL COMMENT '장소명 (예: 연남동)',
    emoji               VARCHAR(8)      DEFAULT '📍',
    district            VARCHAR(30)     NOT NULL COMMENT '구/동 정보 (예: 마포구)',
    latitude            DECIMAL(10,7)   NOT NULL COMMENT 'GPS 위도',
    longitude           DECIMAL(10,7)   NOT NULL COMMENT 'GPS 경도',
    congestion_level    ENUM('여유','보통','혼잡')   DEFAULT '보통' COMMENT '현재 혼잡도',
    congestion_desc     VARCHAR(200)    DEFAULT NULL COMMENT '혼잡도 설명 텍스트',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_district (district),
    INDEX idx_congestion (congestion_level)
) COMMENT '장소 마스터 테이블';


-- =============================================================
-- 3. place_congestion_hourly (시간대별 혼잡도)
-- =============================================================
CREATE TABLE place_congestion_hourly (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    place_id            BIGINT          NOT NULL,
    hour                TINYINT         NOT NULL COMMENT '0~23 시',
    congestion_level    ENUM('여유','보통','혼잡')   NOT NULL,
    bar_height_pct      TINYINT         NOT NULL COMMENT 'UI 막대 높이 %',
    is_current          BOOLEAN         DEFAULT FALSE COMMENT '현재 시간 여부',
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    UNIQUE KEY uk_place_hour (place_id, hour),
    CHECK (hour BETWEEN 0 AND 23),
    CHECK (bar_height_pct BETWEEN 0 AND 100)
) COMMENT '시간대별 혼잡도 (장소 상세의 바 차트용)';


-- =============================================================
-- 4. place_infra (장소 주변 인프라 - 주차장/화장실/카페/와이파이 등)
-- =============================================================
CREATE TABLE place_infra (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    place_id    BIGINT          NOT NULL,
    type        VARCHAR(20)     NOT NULL COMMENT '주차장/화장실/카페/와이파이 등',
    icon_emoji  VARCHAR(8)      DEFAULT NULL,
    status      VARCHAR(20)     DEFAULT NULL COMMENT '가능/불가/보통 등',
    value_text  VARCHAR(50)     DEFAULT NULL COMMENT '예: 23석, 3개',
    detail_text VARCHAR(200)    DEFAULT NULL COMMENT '예: 250m 이내',
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    INDEX idx_place_type (place_id, type)
) COMMENT '장소 주변 인프라 정보';


-- =============================================================
-- 5. nearby_spots (장소 주변 편의시설)
-- =============================================================
CREATE TABLE nearby_spots (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    place_id        BIGINT          NOT NULL,
    name            VARCHAR(100)    NOT NULL COMMENT '시설명',
    category        VARCHAR(30)     NOT NULL COMMENT '카페/음식점/공원 등',
    icon_emoji      VARCHAR(8)      DEFAULT NULL,
    detail_text     VARCHAR(200)    DEFAULT NULL COMMENT '예: 카페 밀집, 야외 좌석 다수',
    distance_meters INT             NOT NULL COMMENT '거리 (m)',
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    INDEX idx_place_distance (place_id, distance_meters)
) COMMENT '주변 편의시설';


-- =============================================================
-- 6. meetings (모임)
-- =============================================================
CREATE TABLE meetings (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(100)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    place_id        BIGINT          NOT NULL,
    creator_id      BIGINT          NOT NULL COMMENT '주최자',
    meeting_date    DATE            NOT NULL,
    meeting_time    TIME            NOT NULL,
    max_headcount   TINYINT         NOT NULL DEFAULT 4,
    current_count   TINYINT         NOT NULL DEFAULT 1 COMMENT '주최자 포함',
    status          ENUM('recruiting','full','closed','canceled')
                    NOT NULL DEFAULT 'recruiting',
    image_url       VARCHAR(255)    DEFAULT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id)   REFERENCES places(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)  ON DELETE CASCADE,
    INDEX idx_meeting_date_time (meeting_date, meeting_time),
    INDEX idx_status (status)
) COMMENT '모임';


-- =============================================================
-- 7. meeting_participants (모임 참여자)
-- =============================================================
CREATE TABLE meeting_participants (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    meeting_id  BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    joined_at   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    UNIQUE KEY uk_meeting_user (meeting_id, user_id)
) COMMENT '모임 참여자';


-- =============================================================
-- 8. meeting_tags (모임 태그)
-- =============================================================
CREATE TABLE meeting_tags (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    meeting_id  BIGINT          NOT NULL,
    tag_name    VARCHAR(30)     NOT NULL COMMENT '예: 조용한카페, 주차가능, 2시간이내',
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    INDEX idx_tag_name (tag_name)
) COMMENT '모임 태그';


-- =============================================================
-- 9. feeds (실시간 제보)
-- =============================================================
CREATE TABLE feeds (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    author_id   BIGINT          NOT NULL,
    place_id    BIGINT          NOT NULL COMMENT '장소 태그 (필수)',
    category    VARCHAR(20)     NOT NULL COMMENT '혼잡도/맛집/주차/날씨 등',
    content     TEXT            NOT NULL,
    image_url   VARCHAR(255)    DEFAULT NULL,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (place_id)  REFERENCES places(id) ON DELETE CASCADE,
    INDEX idx_place_created (place_id, created_at),
    INDEX idx_category (category)
) COMMENT '실시간 제보 피드';


-- =============================================================
-- 10. feed_comments (제보 댓글)
-- =============================================================
CREATE TABLE feed_comments (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    feed_id     BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    content     TEXT            NOT NULL,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '제보 댓글';


-- =============================================================
-- 11. feed_reactions (제보 반응 - 좋아요/고마워요)
-- =============================================================
CREATE TABLE feed_reactions (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    feed_id     BIGINT          NOT NULL,
    user_id     BIGINT          NOT NULL,
    type        ENUM('helpful','thanks','important')
                NOT NULL DEFAULT 'helpful' COMMENT '👍 도움됐어요 / 🙏 고마워요 등',
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_feed_user_type (feed_id, user_id, type)
) COMMENT '제보 반응';


-- =============================================================
-- 12. visit_logs (방문 인증 기록)
-- =============================================================
CREATE TABLE visit_logs (
    id                      BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT          NOT NULL,
    place_id                BIGINT          NOT NULL,
    gps_latitude            DECIMAL(10,7)   NOT NULL,
    gps_longitude           DECIMAL(10,7)   NOT NULL,
    manner_points_earned    TINYINT         DEFAULT 2 COMMENT '획득 매너점수',
    verified_at             DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    INDEX idx_user_verified (user_id, verified_at)
) COMMENT 'GPS 방문 인증 기록';


-- =============================================================
-- 13. badges (배지 마스터)
-- =============================================================
CREATE TABLE badges (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(50)     NOT NULL UNIQUE COMMENT '예: 연남동 정복',
    emoji               VARCHAR(8)      NOT NULL,
    description         VARCHAR(200)    DEFAULT NULL,
    unlock_condition    VARCHAR(200)    DEFAULT NULL COMMENT '획득 조건 설명'
) COMMENT '배지 마스터';


-- =============================================================
-- 14. user_badges (유저가 획득한 배지)
-- =============================================================
CREATE TABLE user_badges (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    badge_id    BIGINT          NOT NULL,
    earned_at   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_badge (user_id, badge_id)
) COMMENT '획득 배지';


-- =============================================================
-- (추가) 찜한 장소 - member_favorites.html 에서 사용
-- =============================================================
CREATE TABLE user_favorites (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    place_id        BIGINT          NOT NULL,
    notify_on       BOOLEAN         DEFAULT TRUE COMMENT '혼잡도 변화 알림',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_place (user_id, place_id)
) COMMENT '찜한 장소';


-- =============================================================
-- (추가) 알림 설정 - member_favorites.html 에서 사용
-- =============================================================
CREATE TABLE user_notify_settings (
    user_id             BIGINT      PRIMARY KEY,
    congestion_alert    ENUM('any','uncrowded','crowded','off')
                        DEFAULT 'uncrowded',
    notify_start        TIME        DEFAULT '08:00:00',
    notify_end          TIME        DEFAULT '22:00:00',
    alert_meeting       BOOLEAN     DEFAULT TRUE,
    alert_comment       BOOLEAN     DEFAULT TRUE,
    alert_badge         BOOLEAN     DEFAULT TRUE,
    alert_marketing     BOOLEAN     DEFAULT FALSE,
    updated_at          DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '개인 알림 설정';

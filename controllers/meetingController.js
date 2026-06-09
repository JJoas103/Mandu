const meetingService = require("../services/meetingService");
const commentService = require("../services/commentService");
const placeService = require("../services/placeService");
const kakaoLocalService = require("../services/kakaoLocalService");
const userService = require("../services/userService");
const Activity = require("../models/Activity");

// 모임 목록 조회
const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const status = req.query.status || "";
        const { meetings, totalPages } = await meetingService.getAllMeetings(page, status);
        res.render("meeting/list", { 
            meetings, 
            totalPages, 
            currentPage: page, 
            currentStatus: status 
        });
    } catch (error) {
        next(error);
    }
};

// 모임 작성 페이지
const getWrite = async (req, res, next) => {
    try {
        const area = req.query.area || '';
        let placeInfo = null;
        let parkingCount = 0;
        let restroomCount = 0;

        if (area) {
            placeInfo = await placeService.getPlaceByName(area);
            if (placeInfo) {
                const [parkingInfo, restroomInfo] = await Promise.all([
                    kakaoLocalService.getNearbyParking(placeInfo.latitude, placeInfo.longitude),
                    kakaoLocalService.getNearbyRestrooms(placeInfo.latitude, placeInfo.longitude)
                ]);
                parkingCount = parkingInfo.length;
                restroomCount = restroomInfo.length;
            }
        }
        const markerInfo = await placeService.getAllMarker(); // 지도 마커 정보 가져옴
        res.render("meeting/write", { area, placeInfo, parkingCount, restroomCount, markerInfo });
    } catch (error) {
        next(error);
    }
};

// 모임 작성 처리
const postWrite = async (req, res, next) => {
    try {
        // 이미지 필수 삽입 기능 추가
        if (!req.file) {
            return res.status(400).send("잘못된 접근입니다");
        }
        const meetingDate = new Date(`${req.body.meeting_date}T${req.body.meeting_time}`);
        const meetingData = {
            ...req.body,
            meetingDate,
            author: req.user.id
        };
        const imageUrl = req.file.filename;
        const newMeeting = await meetingService.createMeeting(meetingData, imageUrl);

        // 매너 점수 상승 (+5) 및 활동 기록
        const { actualChange } = await userService.updateMannerScore(req.user.id, 5);

        // 최근 활동 기록 추가
        await Activity.create({
            user: req.user.id,
            type: 'meeting_create', 
            message: `"${newMeeting.title}" 모임 개설`,
            scoreChange: actualChange,
            relatedLink: `/meeting/info/${newMeeting._id}`
        });

        res.redirect("/meeting/list");
    } catch (error) {
        next(error);
    }
};

// 모임 상세 조회
const getInfo = async (req, res, next) => {
    try {
        const meetingId = req.params.id;
        const meeting = await meetingService.getMeetingById(meetingId);
        const commentPage = parseInt(req.query.commentPage) || 1;
        const { comments, totalCommentPages } = await commentService.getCommentsByBoardId(meetingId, commentPage);
        
        res.render("meeting/info", { 
            meeting, 
            comments, 
            totalCommentPages, 
            currentCommentPage: commentPage 
        });
    } catch (error) {
        next(error);
    }
};

// 모임 수정 페이지
const getModify = async (req, res, next) => {
    try {
        const meeting = await meetingService.getMeetingById(req.params.id);
        if (meeting.author._id.toString() !== req.user.id) {
            return res.status(403).send("권한이 없습니다");
        }
        const markerInfo = await placeService.getAllMarker();
        res.render("meeting/modify", { meeting, markerInfo });
    } catch (error) {
        next(error);
    }
};

// 모임 수정 처리
const postModify = async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.filename;
        }
        // 날짜와 시간 합치기
        if (req.body.meeting_date && req.body.meeting_time) {
            updateData.meetingDate = new Date(`${req.body.meeting_date}T${req.body.meeting_time}`);
        }
        
        await meetingService.updateMeeting(req.params.id, updateData, req.user.id);
        res.redirect(`/meeting/info/${req.params.id}`);
    } catch (error) {
        next(error);
    }
};

// 모임 삭제 처리
const postDelete = async (req, res, next) => {

    try {
        await meetingService.deleteMeeting(req.params.id, req.user.id);
        res.redirect("/meeting/list");
    } catch (error) {
        next(error);
    }
};

// 모임 참여 처리
const postJoin = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.xhr) return res.status(401).json({ message: "로그인이 필요합니다" });
        return res.redirect("/member/login");
    }
    try {
        const meetingId = req.params.id;
        const { meeting, action } = await meetingService.toggleMeetingParticipation(meetingId, req.user.id);

        if (action === 'join') {
            // 매너 점수 상승 (+2) 및 활동 기록
            const { actualChange } = await userService.updateMannerScore(req.user.id, 2);

            // 참여 시에만 최근 활동 기록 추가
            await Activity.create({
                user: req.user.id,
                type: 'meeting_join',
                message: `"${meeting.title}" 모임 가입`,
                scoreChange: actualChange,
                relatedLink: `/meeting/info/${meetingId}`
            });
        }

        if (req.xhr) {
            return res.json({ success: true, action, message: action === 'join' ? "모임에 참여했습니다" : "참여를 취소했습니다" });
        }
        res.redirect(`/meeting/info/${meetingId}`);
    } catch (error) {
        if (req.xhr) {
            return res.status(400).json({ message: error.message });
        }
        res.send(`<script>alert("${error.message}"); history.back();</script>`);
    }
};

module.exports = { 
    getList, 
    getWrite, 
    postWrite, 
    getInfo, 
    getModify, 
    postModify, 
    postDelete,
    postJoin,
};

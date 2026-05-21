const meetingService = require("../services/meetingService");
const commentService = require("../services/commentService");

// 모임 목록 조회
const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const { meetings, totalPages } = await meetingService.getAllMeetings(page);
        res.render("meeting/list", { meetings, totalPages, currentPage: page });
    } catch (error) {
        next(error);
    }
};

// 모임 작성 페이지
const getWrite = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    res.render("meeting/write");
};

// 모임 작성 처리
const postWrite = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const meetingDate = new Date(`${req.body.meeting_date}T${req.body.meeting_time}`);
        const meetingData = {
            ...req.body,
            meetingDate,
            author: req.user.id
        };
        const profileImage = req.file ? req.file.fimename : null;
        await meetingService.createMeeting(meetingData, profileImage);
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
        res.render("meeting/modify", { meeting });
    } catch (error) {
        next(error);
    }
};

// 모임 수정 처리
const postModify = async (req, res, next) => {
    try {
        await meetingService.updateMeeting(req.params.id, req.body, req.user.id);
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

module.exports = { 
    getList, 
    getWrite, 
    postWrite, 
    getInfo, 
    getModify, 
    postModify, 
    postDelete 
};

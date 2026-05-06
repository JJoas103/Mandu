const userService = require("../services/userService");
const Meeting = require("../models/Meeting");
const Feed = require("../models/Feed");

// 회원가입 페이지
const getJoin = (req, res) => {
    res.render("member/join", { errors: {} });
};

// 회원가입 처리
const postJoin = async (req, res, next) => {
    try {
        await userService.createUser({ 
            ...req.body, 
            uploadFile: req.file 
        });
        res.redirect("/member/login");
    } catch (error) {
        next(error);
    }
};

// 이메일 중복 확인
const checkEmail = async (req, res, next) => {
    try {
        const available = await userService.checkEmail(req.query.email);
        res.json({ available });
    } catch (error) {
        next(error);
    }
};

// 로그인 페이지
const getLogin = (req, res) => {
    const messages = req.session.messages || [];
    const errorMessage = messages[messages.length - 1] || null;
    req.session.messages = [];
    res.render("member/login", { errorMessage });
};

// 로그아웃 처리
const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};

// 마이페이지
const getInfo = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const [meetingCount, feedCount] = await Promise.all([
            Meeting.countDocuments({ author: req.user.id }),
            Feed.countDocuments({ author: req.user.id })
        ]);
        res.render("member/info", {
            user: req.user,
            meetingCount,
            feedCount
        });
    } catch (error) {
        next(error);
    }
};

// 회원 수정 페이지
const getModify = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    res.render("member/modify", { user: req.user });
};

// 회원 수정 처리
const postModify = async (req, res, next) => {
    try {
        await userService.updateUser(req.user.id, { 
            ...req.body, 
            uploadFile: req.file 
        });
        res.redirect("/member/info");
    } catch (error) {
        next(error);
    }
};

// 회원 탈퇴 처리
const postDelete = async (req, res, next) => {
    try {
        await userService.deleteUser(req.user.id, req.body.password);
        req.logout((err) => {
            if (err) return next(err);
            res.redirect("/");
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getJoin, 
    postJoin, 
    checkEmail, 
    getLogin, 
    logout, 
    getInfo, 
    getModify, 
    postModify, 
    postDelete 
};

const feedService = require("../services/feedService");
const commentService = require("../services/commentService");

// 제보 목록 조회
const getList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const { feeds, totalPages } = await feedService.getAllFeeds(page);
        res.render("feed/list", { feeds, totalPages, currentPage: page });
    } catch (error) {
        next(error);
    }
};

// 제보 작성 페이지
const getWrite = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    res.render("feed/write");
};

// 제보 작성 처리
const postWrite = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const feedData = {
            ...req.body,
            author: req.user.id,
            image: req.file ? req.file.filename : null
        };
        await feedService.createFeed(feedData);
        res.redirect("/feed/list");
    } catch (error) {
        next(error);
    }
};

// 제보 상세 조회
const getInfo = async (req, res, next) => {
    try {
        const feedId = req.params.id;
        const feed = await feedService.getFeedById(feedId);
        const commentPage = parseInt(req.query.commentPage) || 1;
        const { comments, totalCommentPages } = await commentService.getCommentsByBoardId(feedId, commentPage);
        
        res.render("feed/info", { 
            feed, 
            comments, 
            totalCommentPages, 
            currentCommentPage: commentPage 
        });
    } catch (error) {
        next(error);
    }
};

// 제보 수정 페이지
const getModify = async (req, res, next) => {
    try {
        const feed = await feedService.getFeedById(req.params.id);
        if (feed.author._id.toString() !== req.user.id) {
            return res.status(403).send("권한이 없습니다");
        }
        res.render("feed/modify", { feed });
    } catch (error) {
        next(error);
    }
};

// 제보 수정 처리
const postModify = async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.image = req.file.filename;
        
        await feedService.updateFeed(req.params.id, updateData, req.user.id);
        res.redirect(`/feed/info/${req.params.id}`);
    } catch (error) {
        next(error);
    }
};

// 제보 삭제 처리
const postDelete = async (req, res, next) => {
    try {
        await feedService.deleteFeed(req.params.id, req.user.id);
        res.redirect("/feed/list");
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

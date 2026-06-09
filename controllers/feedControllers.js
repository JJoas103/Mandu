const feedService = require("../services/feedService");
const commentService = require("../services/commentService");
const userService = require("../services/userService");
const Notification = require("../models/Notification");
const Feed = require("../models/Feed");
const Activity = require("../models/Activity");

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
    const prePlace = req.query.place_id
        ? { id: req.query.place_id, name: decodeURIComponent(req.query.place_name || '') }
        : null;
    res.render("feed/write", { prePlace });
};

// 제보 작성 처리
const postWrite = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/member/login");
    try {
        const userId = req.user.id;
        const feedData = {
            ...req.body,
            author: userId,
            image: req.file ? req.file.filename : null
        };
        const newFeed = await feedService.createFeed(feedData);

        // 매너 점수 상승 (+1) 및 활동 기록
        const { actualChange } = await userService.updateMannerScore(userId, 1);
        
        await Activity.create({
            user: userId,
            type: 'feed_write',
            message: `실시간 제보 작성`,
            scoreChange: actualChange,
            relatedLink: `/feed/info/${newFeed._id}`
        });

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

// 제보 추천 처리
const postLike = async (req, res, next) => {
    if (!req.isAuthenticated()) return res.json({ success: false, message: "로그인이 필요합니다" });
    try {
        const feedId = req.params.id;
        const feed = await Feed.findById(feedId); // feedService 대신 모델 직접 접근 (likedBy 확인 위해)
        
        if (!feed) return res.json({ success: false, message: "제보를 찾을 수 없습니다" });

        // 중복 추천 확인
        if (feed.likedBy.includes(req.user.id)) {
            return res.json({ success: false, message: "추천한 게시글 입니다." });
        }

        // 본인 글은 추천 불가
        if (feed.author && feed.author.toString() === req.user.id) {
            return res.json({ success: false, message: "본인의 제보에는 추천할 수 없습니다" });
        }

        // 추천 정보 업데이트
        feed.reactions.like += 1;
        feed.likedBy.push(req.user.id);
        await feed.save();
        
        // 작성자 매너 점수 상승 (+2) 및 알림 생성
        if (feed.author) {
            const { actualChange } = await userService.updateMannerScore(feed.author, 2);
            
            await Notification.create({
                user: feed.author,
                type: 'like',
                message: `실시간 제보에 추천을 받아 매너점수가 ${actualChange.toFixed(1)}점이 올랐어요.`,
                relatedLink: `/feed/info/${feedId}`
            });

            // 활동 내역 추가 (작성자의 히스토리에 남도록)
            await Activity.create({
                user: feed.author,
                type: 'like_received',
                message: `제보 추천 받음`,
                scoreChange: actualChange,
                relatedLink: `/feed/info/${feedId}`
            });
        }

        res.json({ success: true, likeCount: feed.reactions.like });
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
    postDelete,
    postLike
};

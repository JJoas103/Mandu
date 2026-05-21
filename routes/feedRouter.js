const express = require('express');
const path = require('path');
const Feed = require('../models/Feed');
const FeedComment = require('../models/FeedComment');

const router = express.Router();

const placeMap = {
    '1': '연남동',
    '2': '북촌',
    '3': '강남역',
    '4': '서래마을',
    '5': '잠실',
    '6': '서울숲',
    '7': '성수동',
    '8': '익선동'
};
function getWriterName(req) {
    if (req.user) {
        return req.user.name || req.user.email || '익명';
    }
    return '익명';
}
// HTML 페이지 연결
// 제보 목록 페이지
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTML/feed_list.html'));
});
// 제보 작성 페이지
router.get('/write', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTML/feed_write.html'));
});
// 제보 상세 페이지
router.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTML/feed_info.html'));
});
// 제보 수정 페이지
router.get('/modify', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTML/feed_modify.html'));
});
// 제보 삭제 페이지
router.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTML/feed_delete.html'));
});
// API: 제보 목록 조회
router.get('/api/list', async (req, res, next) => {
    try {
        const { category, place_id } = req.query;
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (place_id) {
            filter.place_id = place_id;
        }
        const feeds = await Feed.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            success: true,
            feeds
        });
    } catch (error) {
        next(error);
    }
});
// API: 제보 상세 조회
router.get('/api/:id', async (req, res, next) => {
    try {
        const feed = await Feed.findById(req.params.id).lean();

        if (!feed) {
            return res.status(404).json({
                success: false,
                message: '제보를 찾을 수 없습니다.'
            });
        }
        const comments = await FeedComment.find({ feed_id: req.params.id })
            .sort({ createdAt: 1 })
            .lean();
        res.json({
            success: true,
            feed,
            comments
        });
    } catch (error) {
        next(error);
    }
});
// 제보 작성
router.post('/write', async (req, res, next) => {
    try {
        const { place_id, category, content, gps_verified } = req.body || {};
        if (!place_id || !category || !content) {
            return res.status(400).send(`
                <script>
                    alert('장소, 카테고리, 내용은 필수입니다.');
                    history.back();
                </script>
            `);
        }
        const place_name = placeMap[place_id] || '기타';
        await Feed.create({
            place_id,
            place_name,
            category,
            content,
            gps_verified: gps_verified === '1',
            writer_name: getWriterName(req)
        });
        res.redirect('/feed');
    } catch (error) {
        next(error);
    }
});
// 제보 수정
router.post('/modify', async (req, res, next) => {
    try {
        const { feed_id, place_id, category, content, gps_verified } = req.body || {};
        if (!feed_id || !place_id || !category || !content) {
            return res.status(400).send(`
                <script>
                    alert('수정할 제보 정보가 부족합니다.');
                    history.back();
                </script>
            `);
        }
        const place_name = placeMap[place_id] || '기타';
        await Feed.findByIdAndUpdate(feed_id, {
            place_id,
            place_name,
            category,
            content,
            gps_verified: gps_verified === '1'
        });
        res.redirect(`/feed/info?feed_id=${feed_id}`);
    } catch (error) {
        next(error);
    }
});
// 제보 삭제
router.post('/delete', async (req, res, next) => {
    try {
        const { feed_id } = req.body || {};
        if (!feed_id) {
            return res.status(400).send(`
                <script>
                    alert('삭제할 제보 ID가 없습니다.');
                    history.back();
                </script>
            `);
        }
        await Feed.findByIdAndDelete(feed_id);
        await FeedComment.deleteMany({ feed_id });
        res.redirect('/feed');
    } catch (error) {
        next(error);
    }
});
// 댓글 작성
router.post('/comment', async (req, res, next) => {
    try {
        const { feed_id, content } = req.body || {};
        if (!feed_id || !content) {
            return res.status(400).send(`
                <script>
                    alert('댓글 내용을 입력해주세요.');
                    history.back();
                </script>
            `);
        }
        await FeedComment.create({
            feed_id,
            content,
            writer_name: getWriterName(req)
        });
        await Feed.findByIdAndUpdate(feed_id, {
            $inc: { comment_count: 1 }
        });
        res.redirect(`/feed/info?feed_id=${feed_id}`);
    } catch (error) {
        next(error);
    }
});
// 도움됐어요
router.post('/react', async (req, res, next) => {
    try {
        const { feed_id } = req.body || {};
        const referer = req.get('Referer') || '/feed';
        if (!feed_id) {
            return res.redirect(referer);
        }
        await Feed.findByIdAndUpdate(feed_id, {
            $inc: { helpful_count: 1 }
        });
        res.redirect(referer);
    } catch (error) {
        next(error);
    }
});
module.exports = router;
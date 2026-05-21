const express = require('express');
const router = express.Router();
const meetingService = require('../services/meetingService');

router.get('/', async (req, res, next) => {
    try {
        // 데이터가 없어도 에러가 나지 않도록 빈 배열 처리
        let mainMeetings = [];
        try {
            mainMeetings = await meetingService.getMainMeetings();
        } catch (e) {
            console.warn("⚠️ 메인 데이터를 가져오는 데 실패했습니다 (DB 확인 필요):", e.message);
        }
        res.render('index', { title: '메인페이지', mainMeetings: mainMeetings || [] });
    } catch (error) {
        next(error);
    }
});
const mainController = require('../controllers/mainController');

router.get('/', mainController.getPlaceInfo);

module.exports = router;

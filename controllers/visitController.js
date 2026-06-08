const User = require('../models/User');
const VisitLog = require('../models/VisitLog');

exports.postVerify = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { place_id, place_name } = req.body;
    const userId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyVisited = await VisitLog.findOne({
        userId,
        placeId: place_id,
        createdAt: { $gte: todayStart }
    });

    if (alreadyVisited) {
        return res.json({ success: false, message: '오늘 이미 방문 인증한 장소입니다.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { manner_score: 2 } },
        { new: true }
    );

    await VisitLog.create({
        userId,
        placeId: place_id,
        placeName: place_name || '',
        pointsEarned: 2
    });

    res.json({
        success: true,
        message: '방문 인증 완료! 매너 점수 +2',
        newScore: updatedUser.manner_score
    });
};

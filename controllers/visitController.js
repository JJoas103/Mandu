const User = require('../models/User');
const VisitLog = require('../models/VisitLog');
const Activity = require('../models/Activity');

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

    const currentScore = req.user.manner_score || 50;
    const pointsToAdd = 2;
    const newScore = Math.min(100, currentScore + pointsToAdd);
    const actualGained = newScore - currentScore;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { manner_score: newScore },
        { new: true }
    );

    await VisitLog.create({
        userId,
        placeId: place_id,
        placeName: place_name || '',
        pointsEarned: actualGained
    });

    // 최근 활동 기록 추가 (점수 변동 포함)
    await Activity.create({
        user: userId,
        type: 'visit_verify',
        message: `${place_name || '장소'} 방문 인증`,
        scoreChange: actualGained,
        relatedLink: `/place/${place_id}`
    });

    res.json({
        success: true,
        message: '방문 인증 완료! 매너 점수 +2',
        newScore: updatedUser.manner_score
    });
};

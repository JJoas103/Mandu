const placeService = require('../services/placeService');
const kakaoLocalService = require('../services/kakaoLocalService');
const meetingService = require('../services/meetingService');

const getMain = async (req, res, next) => {
    try {
        let mainMeetings = [];
        try {
            mainMeetings = await meetingService.getMainMeetings();
        } catch (e) {
            console.warn("메인 데이터를 가져오는데 실패했습니다: ", e.message);
        }
        const markerInfo = await placeService.getAllMarker();
        const placeInfoLimtRaw = await placeService.getPlaceInfoLimt();
        const images = await Promise.all(placeInfoLimtRaw.map(p => kakaoLocalService.getPlaceImage(p.name)));
        const placeInfoLimt = placeInfoLimtRaw.map((p, i) => ({ ...p.toObject(), imageUrl: images[i] }));
        res.render('index', { mainMeetings, markerInfo, placeInfoLimt, searchError: null });
    } catch (error) {
        next(error);
    }
}
module.exports = { getMain };

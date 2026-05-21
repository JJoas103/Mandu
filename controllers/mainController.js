const placeService = require('../services/placeService');
const placeApiService = require('../services/placeApiService');
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
        const placeInfoLimt = await placeService.getPlaceInfoLimt();    // 장소정보(이름, 혼잡도) 리미트 4개
        res.render('index', { mainMeetings, markerInfo, placeInfoLimt });
    } catch (error) {
        next(error);        
    }
}
module.exports = { getMain };
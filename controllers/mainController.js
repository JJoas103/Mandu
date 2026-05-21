const placeService = require('../services/placeService');
const placeApiService = require('../services/placeApiService');

const getPlaceInfo = async (req, res, next) => {
    try {
        const markerInfo = await placeService.getAllMarker();   //모든마커정보(장소이름, 위도, 경도, 혼잡도)
        const placeInfoLimt = await placeService.getPlaceInfoLimt();    // 장소정보(이름, 혼잡도) 리미트 4개
        res.render('index', { markerInfo, placeInfoLimt });
        console.log(placeInfoLimt);
    } catch (error) {
        next(error);
    }
}

module.exports = { getPlaceInfo };
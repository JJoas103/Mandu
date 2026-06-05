const placeService = require('../services/placeService');
const kakaoLocalService = require('../services/kakaoLocalService');
const meetingService = require('../services/meetingService');
const weatherService = require('../services/weatherService');
const Favorite = require('../models/Favorite');

const getPlaceInfo = async (req, res, next) => {
    try {
        const { area_cd } = req.params;
        const place = await placeService.getPlaceByAreaCd(area_cd);
        const [parkingInfo, restroomInfo, meetings, weather, transitInfo, placeImage] = await Promise.all([
            kakaoLocalService.getNearbyParking(place.latitude, place.longitude),
            kakaoLocalService.getNearbyRestrooms(place.latitude, place.longitude),
            meetingService.getMeetingsByArea(place.name),
            weatherService.getWeather(place.latitude, place.longitude),
            kakaoLocalService.getNearbyTransit(place.latitude, place.longitude),
            kakaoLocalService.getPlaceImage(place.name)
        ]);

        let isFavorite = false;
        if (req.user) {
            const favorite = await Favorite.findOne({ user: req.user.id, place_id: area_cd });
            isFavorite = !!favorite;
        }

        res.render('place/place_info', { place, parkingInfo, restroomInfo, meetings, weather, transitInfo, placeImage, isFavorite });
    } catch (error) {
        next(error);
    }
};

const getSearch = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        if (!keyword || !keyword.trim()) {
            return res.redirect('/');
        }
        const results = await placeService.searchPlacesByName(keyword.trim());
        if (results.length === 1) {
            return res.redirect(`/place/${results[0].area_cd}`);
        }
        if (results.length === 0) {
            const markerInfo = await placeService.getAllMarker();
            const placeInfoLimtRaw = await placeService.getPlaceInfoLimt();
            const images = await Promise.all(placeInfoLimtRaw.map(p => kakaoLocalService.getPlaceImage(p.name)));
            const placeInfoLimt = placeInfoLimtRaw.map((p, i) => ({ ...p.toObject(), imageUrl: images[i] }));
            const mainMeetings = await meetingService.getMainMeetings();
            return res.render('index', { markerInfo, placeInfoLimt, mainMeetings, searchError: `"${keyword}"에 해당하는 장소를 찾을 수 없습니다.` });
        }
        const imagesArr = await Promise.all(results.map(r => kakaoLocalService.getPlaceImage(r.name)));
        const resultsWithImages = results.map((r, i) => ({ ...r.toObject(), imageUrl: imagesArr[i] }));
        res.render('place/search_result', { keyword, results: resultsWithImages });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPlaceInfo, getSearch };

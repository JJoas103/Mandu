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

        res.render('place/place_info', { 
            place, parkingInfo, restroomInfo, meetings, weather, transitInfo, placeImage,
            isFavorite
        });
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
            return res.render('place/search_result', { keyword, results: [] });
        }
        const imagesArr = await Promise.all(results.map(r => kakaoLocalService.getPlaceImage(r.name)));
        const resultsWithImages = results.map((r, i) => ({ ...r.toObject(), imageUrl: imagesArr[i] }));
        res.render('place/search_result', { keyword, results: resultsWithImages });
    } catch (error) {
        next(error);
    }
};

const getAllPlaces = async (req, res, next) => {
    try {
        const markerInfo = await placeService.getAllMarker();
        const imagesArr = await Promise.all(markerInfo.map(r => kakaoLocalService.getPlaceImage(r.name)));
        const results = markerInfo.map((r, i) => {
            const obj = typeof r.toObject === 'function' ? r.toObject() : r;
            return { ...obj, imageUrl: imagesArr[i] };
        });
        res.render('place/search_result', { keyword: '전체 장소', results });
    } catch (error) {
        next(error);
    }
};

const getQuietPlaces = async (req, res, next) => {
    try {
        const quietPlaces = await placeService.getAllQuietPlaces();
        const imagesArr = await Promise.all(quietPlaces.map(r => kakaoLocalService.getPlaceImage(r.name)));
        const results = quietPlaces.map((r, i) => {
            const obj = typeof r.toObject === 'function' ? r.toObject() : r;
            return { ...obj, imageUrl: imagesArr[i] };
        });
        res.render('place/search_result', { keyword: '한산한 명소', results });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPlaceInfo, getSearch, getAllPlaces, getQuietPlaces };

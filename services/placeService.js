const Place = require("../models/place");
const Congestion = require("../models/congestion");

async function getAllMarker(){
    const markerInfo = await Place.find({})
                            .select('area_cd name latitude longitude congest_lvl')
                            .sort({updatedAt : -1});
    return markerInfo;
}

async function getPlaceCongLimt() {
    const placeCongLimt = await Place.find({ congest_lvl: '여유'})
                            .select('name congest_lvl')
                            .sort({updateAt : -1})
                            .limit(4);
    return placeCongLimt;
}   

// 실시간 급증 TOP 5 — surge_pct 기준 내림차순
async function getSurgeTop5() {
    return await Congestion.find({ surge_pct: { $ne: null } })
        .sort({ surge_pct: -1 })
        .limit(5)
        .select('area_cd area_nm surge_pct area_congest_lvl ppltn_time');
}

// 현재 가장 혼잡한 TOP 3 — 서울 사이트와 동일 기준 (혼잡도 점수 → 인구수 순)
async function getCongestTop5() {
    return await Congestion.find({ congest_score: { $ne: null } })
        .sort({ congest_score: -1, area_ppltn_max: -1 })
        .limit(3)
        .select('area_cd area_nm area_congest_lvl congest_score area_ppltn_max ppltn_time');
}



// 상세 페이지용 — 시간대 바 그래프 + 현재 혼잡도
async function getCongestionDetail(area_cd) {
    return await Congestion.findOne({ area_cd })
        .select('area_nm ppltn_time area_congest_lvl surge_pct fcst_yn fcst_list');
}

async function getPlaceInfoLimt() {
    const placeInfoLimt = await Place.find({ congest_lvl: '여유'})
                            .select('area_cd name congest_lvl')
                            .sort({updateAt : -1})
                            .limit(4);
    return placeInfoLimt;
}

async function getPlaceByAreaCd(area_cd) {
    const place = await Place.findOne({ area_cd });
    if (!place) throw new Error('장소를 찾을 수 없습니다');
    return place;
}

async function searchPlacesByName(keyword) {
    const regex = new RegExp(keyword, 'i');
    return await Place.find({ name: regex })
                      .select('area_cd name congest_lvl')
                      .limit(10);
}

module.exports = { getAllMarker, getPlaceInfoLimt, getSurgeTop5, getCongestTop5, getCongestionDetail, getPlaceByAreaCd, searchPlacesByName };

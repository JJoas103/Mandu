const Place = require("../models/place");

async function getAllMarker(){
    const markerInfo = await Place.find({})
                            .select('area_cd name latitude longitude congest_lvl')
                            .sort({updatedAt : -1});
    return markerInfo;
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

module.exports = { getAllMarker, getPlaceInfoLimt, getPlaceByAreaCd, searchPlacesByName };

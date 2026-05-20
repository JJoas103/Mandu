const Place = require("../models/place");

async function getAllMarker(){
    const markerInfo = await Place.find({})
                            .select('name latitude longitude congest_lvl')
                            .sort({updatedAt : -1});
    return markerInfo;
}

async function getPlaceInfoLimt() {
    const placeInfoLimt = await Place.find({ congest_lvl: '여유'})
                            .select('name congest_lvl')
                            .sort({updateAt : -1})
                            .limit(4);
    return placeInfoLimt;
}   

module.exports = { getAllMarker, getPlaceInfoLimt };

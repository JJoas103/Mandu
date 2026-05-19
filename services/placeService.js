const Place = require("../models/place");

async function getAllMarker(){
    const markerInfo = await Place.find({})
                            .select('name latitude longitude congest_lvl')
                            .sort({updatedAt : -1});
    return markerInfo;
}

module.exports = { getAllMarker };

const placeService = require('../services/placeService');
const placeApiService = require('../services/placeApiService');

const getPlaceInfo = async (req, res, next) => {
    const place_name = req.params.info;

    try {
        //const places = await placeService.getPlaceInfoByName
    } catch (error) {
        
    }
}

module.exports = { getPlaceInfo };
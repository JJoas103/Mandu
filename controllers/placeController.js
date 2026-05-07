const placeService = require('../services/placeService');

const getMapView = async (req, res, next) => {
    try {
        const Mapview = await placeService.getMapView();
        res.render('/', { Mapview });
    } catch(error) {
        next(error);
    }
}

const getLocation = async (req, res, next) => {

    try {
        const Location = await placeService.getLocation();
        res.render('/', { Location });
    } catch(error) {
        next(error);
    }
}
module.exports = { getMapView };
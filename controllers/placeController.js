const placeService = require('../services/placeService');
const placeApiService = require('../services/placeApiService');

// const getMarker = async (req, res, next) => {
//     try {
//         const markerInfo = await placeService.getAllMarker();
//         const relaxedPlaces = await placeService.getRelaxedPlaces();
//         res.render('index', { markerInfo, relaxedPlaces });
//         console.log(relaxedPlaces);
//     } catch (error) {
//         next(error);
//     }
// }

// module.exports = { getMarker };
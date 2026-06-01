const mongoose = require('mongoose');

const NearBySpotsScema = new mongoose.Schema(
    {
        area_cd: {  //관광지번호
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Place',
                    required: true
        },
        name: { //시설명
            type: String,
            required: true
        },
        category: { //카페/음식점/공원 등
            type: String, 
            required: true
        },
        detail_text: {
            type: String
        },
        distance_metars: {
            type: int,

        }
    }
);

const NearBySpots = mongoose.model('NearBySpots', NearBySpotsScema);
module.exports = NearBySpots;
const mongoose = require('mongoose');

const placeInfraSchema = new mongoose.Schema(
    {
        area_cd: {  //관광지번호
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
            required: true
        },
        type: { //주차장/화장실/카페/와이파이 등
            type: String,
            required: true
        },
        status: {   //'가능/불가/보통 등'
            type: String
        },
        value_text : {  //'예: 23석, 3개'
            type: String
        },
        detail_text: {  //'예: 250m 이내'
            type: String
        }
    }
);

const PlaceInfra = mongoose.model('PlaceInfra', placeInfraSchema);
module.exports = PlaceInfra;
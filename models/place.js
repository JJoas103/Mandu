const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
    {
        name : {type: String, require: true},
        area_name : {type: String},
        eng_name : {type: String},
        latitude : {type: Double},  //위도
        longitude : {type : Double}, //경도
        congestion_level : {enum: ['여유', '보통', '혼잡'], default: '보통'},
        congestion_desc : {type : String, default: null},
    },{
        timestamps: true
    }
);

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;


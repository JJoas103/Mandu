const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
    {
        area_cd: {
            type: String, require: true, unique: true
        },
        category: {type: String},
        name : {type: String, require: true},
        eng_name : {type: String},
        latitude : {type: Number},
        longitude : {type: Number},
        congest_lvl : { type: String },
        temp : {type: String},  //기온
        sky_stts: {type: String},//날씨정보
        humidity: {type: String},//습도
        
    },{
        timestamps: true
    }
);

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;

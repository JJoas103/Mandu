const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
    {
        area_cd: {
            type: String, require: true, unique: true
        },
        categoey: {type: String},
        name : {type: String, requie: true},
        eng_name : {type: String},
        latitude : {type: Number},
        longitude : {type: Number},
        congestion_level : {enum: ['여유', '보통', '혼잡'], default: '보통'},
        congestion_desc : {type: String , default: null},
    },{
        timestamps: true
    }
);
 
const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
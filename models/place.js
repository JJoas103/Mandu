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
        congest_lvl : {type: String},
    },{
        timestamps: true
    }
);
 
const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
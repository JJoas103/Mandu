const mongoose = require('mongoose');

const toiletInfoSchema = new mongoose.Schema({
    
});

const ToiletInfo = mongoose.model("ToiletInfo", toiletInfoSchema);
module.exports = ToiletInfo;
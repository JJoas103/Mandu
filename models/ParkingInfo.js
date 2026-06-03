const mongoose = require('mongoose');

const parkingInfoSchema = new mongoose.Schema({
    pklt_cd: {type: String, required: true},        //주차장코드
    pklt_nm: {type: String, required: true},        //주차장명
    addr: {type: String, required: true},           //주소
    prk_stts_yn: {type: String, required: true},    //주차현황정보 제공 여부
    now_prk_vhcl_cnt: {type: Number, required: true}, //현재 주차 차량 수
    cur_prk_yn:  {type: String, default: null},     //현재 주차 가능 여부 (Y/N) ← citydata PRK_STTS
    cur_prk_cnt: {type: Number, default: null},     //현재 주차 가능 대수      ← citydata PRK_STTS
},{ timestamps: true });

const ParkingInfo = mongoose.model("Parking", parkingInfoSchema);
module.exports = ParkingInfo;

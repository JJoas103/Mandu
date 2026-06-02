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





/*
관계와 프로세스가 혼재되어있음
스케줄 신청한느 과정은 프로세스고
개체는 스케줄만 있으면되고 스케줄요청, 근태 이렇게 연결할 피료는 없다
뭔가 프로세스가 나열되어있음
급여산정도 이 과정은 프로세스지 직원-근태로 연결만하고 그 사이 관계를 성립하면 됨.

*/
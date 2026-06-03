const mongoose = require('mongoose');

const fcstItemSchema = new mongoose.Schema({
    fcst_time:        { type: String },   // 예측 시각
    fcst_congest_lvl: { type: String },   // 예측 혼잡도
    fcst_ppltn_min:   { type: Number },   // 예측 인구 최솟값
    fcst_ppltn_max:   { type: Number },   // 예측 인구 최댓값
}, { _id: false });

const congestionSchema = new mongoose.Schema({
    area_cd:          { type: String, required: true, unique: true },
    area_nm:          { type: String },   // 장소명 (표시용 비정규화)
    ppltn_time:       { type: String },   // 갱신 기준 시각
    area_congest_lvl: { type: String },   // 현재 혼잡도 ("여유"|"보통"|"약간 붐빔"|"붐빔")
    area_ppltn_max:   { type: Number },   // 현재 인구 최댓값 (급증률 계산 기준)
    surge_pct:        { type: Number },   // 급증률 % (1시간 후 예측 기준, TOP5 정렬용)
    congest_score:    { type: Number },   // 혼잡도 점수: 여유=0 보통=1 약간붐빔=2 붐빔=3 (정렬용)
    fcst_yn:          { type: String },   // 예측 데이터 제공 여부 (Y/N)
    fcst_list:        { type: [fcstItemSchema], default: [] }, // 시간대별 예측 (바 그래프용)
}, { timestamps: true });

const Congestion = mongoose.model('Congestion', congestionSchema);
module.exports = Congestion;

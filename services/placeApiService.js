const axios = require('axios');
const Place = require('../models/Place');
const Congestion = require('../models/Congestion');

const CONGEST_SCORE = { '여유': 0, '보통': 1, '약간 붐빔': 2, '붐빔': 3 };
const API_KEY = process.env.SEOUL_API_KEY || '516f6562436b79753932784c6f6568';
const API_BASE = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/citydata/1/5`;
const DELAY_MS = 300;

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const extractCongestionData = (cityData) => {
    if (!cityData) return null;
    const raw = cityData.LIVE_PPLTN_STTS;
    if (!raw) return null;

    const d = Array.isArray(raw) ? raw[0] : raw;

    const ppltn_time       = d.PPLTN_TIME       || null;
    const area_congest_lvl = d.AREA_CONGEST_LVL || null;
    const area_ppltn_max   = d.AREA_PPLTN_MAX   != null ? parseInt(d.AREA_PPLTN_MAX, 10) : null;
    const fcst_yn          = d.FCST_YN           || 'N';

    let fcst_list = [];
    if (fcst_yn === 'Y') {
        const rawFcst = d.FCST_PPLTN;
        if (rawFcst) {
            const arr = Array.isArray(rawFcst) ? rawFcst : [rawFcst];
            fcst_list = arr.map((f) => ({
                fcst_time:        f.FCST_TIME        || null,
                fcst_congest_lvl: f.FCST_CONGEST_LVL || null,
                fcst_ppltn_min:   f.FCST_PPLTN_MIN != null ? parseInt(f.FCST_PPLTN_MIN, 10) : null,
                fcst_ppltn_max:   f.FCST_PPLTN_MAX != null ? parseInt(f.FCST_PPLTN_MAX, 10) : null,
            }));
        }
    }

    const congest_score = CONGEST_SCORE[area_congest_lvl] ?? null;

    let surge_pct = null;
    if (area_ppltn_max && fcst_list.length > 0 && fcst_list[0].fcst_ppltn_max != null) {
        surge_pct = Math.round(
            (fcst_list[0].fcst_ppltn_max - area_ppltn_max) / area_ppltn_max * 100
        );
    }

    return { ppltn_time, area_congest_lvl, congest_score, area_ppltn_max, surge_pct, fcst_yn, fcst_list };
};

const fetchAndParse = async (area_cd) => {
    const url = `${API_BASE}/${area_cd}`;
    const response = await axios.get(url, { timeout: 10000 });
    const cityData = response.data['CITYDATA'];
    const data = extractCongestionData(cityData);
    if (!data) throw new Error('LIVE_PPLTN_STTS 데이터 없음');
    return data;
};

const updateAllCongestion = async () => {
    const places = await Place.find({}).select('area_cd name');
    let success = 0, fail = 0;

    for (const place of places) {
        try {
            const data = await fetchAndParse(place.area_cd);
            await Promise.all([
                Congestion.findOneAndUpdate(
                    { area_cd: place.area_cd },
                    { area_cd: place.area_cd, area_nm: place.name, ...data },
                    { upsert: true, new: true }
                ),
                Place.findOneAndUpdate(
                    { area_cd: place.area_cd },
                    { congest_lvl: data.area_congest_lvl }
                ),
            ]);
            success++;
        } catch (err) {
            console.error(`[혼잡도] ${place.name} (${place.area_cd}): ${err.message}`);
            fail++;
        }
        await sleep(DELAY_MS);
    }

    console.log(`[혼잡도 갱신] 완료 — 성공 ${success} / 실패 ${fail}`);
};

module.exports = { updateAllCongestion };

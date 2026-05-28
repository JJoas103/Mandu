require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const xml2js = require('xml2js');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Place = require('../models/place');

const EXCEL_PATH = process.env.EXCEL_PATH || 'C:/Users/kyumi/Downloads/서울시 주요 121장소 목록 (1).xlsx';
const API_KEY = process.env.SEOUL_API_KEY || '516f6562436b79753932784c6f6568';
const API_BASE = `http://openapi.seoul.go.kr:8088/${API_KEY}/xml/citydata/1/5`;
const DELAY_MS = 300;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readPlacesFromExcel() {
    const wb = XLSX.readFile(EXCEL_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws);
}

function extractCoordinates(cityData) {
    const prkStts = cityData.PRK_STTS?.PRK_STTS;
    if (prkStts) {
        const list = Array.isArray(prkStts) ? prkStts : [prkStts];
        const valid = list.filter((p) => p.LAT && p.LNG);
        if (valid.length > 0) {
            const lat = valid.reduce((sum, p) => sum + parseFloat(p.LAT), 0) / valid.length;
            const lng = valid.reduce((sum, p) => sum + parseFloat(p.LNG), 0) / valid.length;
            return { latitude: lat, longitude: lng };
        }
    }

    const busStts = cityData.BUS_STN_STTS?.BUS_STN_STTS;
    if (busStts) {
        const first = Array.isArray(busStts) ? busStts[0] : busStts;
        if (first.BUS_STN_X && first.BUS_STN_Y) {
            return {
                latitude: parseFloat(first.BUS_STN_Y),
                longitude: parseFloat(first.BUS_STN_X),
            };
        }
    }

    const chargerStts = cityData.CHARGER_STTS?.CHARGER_STTS;
    if (chargerStts) {
        const first = Array.isArray(chargerStts) ? chargerStts[0] : chargerStts;
        if (first.STAT_X && first.STAT_Y) {
            return {
                latitude: parseFloat(first.STAT_Y),
                longitude: parseFloat(first.STAT_X),
            };
        }
    }

    return null;
}

function extractCongestLvl(cityData) {
    // LIVE_PPLTN_STTS 안의 AREA_CONGEST_LVL 추출
    const livePpltn = cityData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS;
    if (!livePpltn) return null;

    const data = Array.isArray(livePpltn) ? livePpltn[0] : livePpltn;
    return data.AREA_CONGEST_LVL || null;
}

async function fetchPlaceData(areaCd) {
    const url = `${API_BASE}/${areaCd}`;
    const response = await axios.get(url, { timeout: 10000 });
    const parser = new xml2js.Parser({ explicitArray: false });

    return new Promise((resolve, reject) => {
        parser.parseString(response.data, (err, result) => {
            if (err) return reject(err);

            try {
                const cityData = result['SeoulRtd.citydata']['CITYDATA'];
                const coords = extractCoordinates(cityData);
                if (!coords) {
                    return reject(new Error('좌표 데이터 없음'));
                }
                const congest_lvl = extractCongestLvl(cityData);
                resolve({ ...coords, congest_lvl });
            } catch (e) {
                reject(new Error(`파싱 실패 (${areaCd}): ${e.message}`));
            }
        });
    });
}

async function seed() {
    await mongoose.connect('mongodb://kyumi1701_db_user:z73e47pzWWfi41SR@ac-5wmdvfn-shard-00-00.temoaxo.mongodb.net:27017,ac-5wmdvfn-shard-00-01.temoaxo.mongodb.net:27017,ac-5wmdvfn-shard-00-02.temoaxo.mongodb.net:27017/MoyeoBom?ssl=true&replicaSet=atlas-14jimc-shard-0&authSource=admin&appName=Cluster0');
    console.log('DB 연결 성공');

    const places = readPlacesFromExcel();
    console.log(`엑셀에서 ${places.length}개 장소 로드 완료\n`);

    let successCount = 0;
    let failCount = 0;

    for (const place of places) {
        const { AREA_CD, AREA_NM, ENG_NM, CATEGORY } = place;

        try {
            const { latitude, longitude, congest_lvl } = await fetchPlaceData(AREA_CD);

            await Place.findOneAndUpdate(
                { area_cd: AREA_CD },
                {
                    area_cd: AREA_CD,
                    category: CATEGORY,
                    name: AREA_NM,
                    eng_name: ENG_NM,
                    latitude,
                    longitude,
                    congest_lvl,
                },
                { upsert: true, new: true }
            );

            console.log(`[${successCount + 1}/${places.length}] ✓ ${AREA_NM} → 위도:${latitude.toFixed(6)}, 경도:${longitude.toFixed(6)}, 혼잡도:${congest_lvl ?? '없음'}`);
            successCount++;
        } catch (err) {
            console.error(`[실패] ${AREA_NM} (${AREA_CD}): ${err.message}`);
            failCount++;
        }

        await sleep(DELAY_MS);
    }

    console.log(`\n완료: 성공 ${successCount}개 / 실패 ${failCount}개`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('시드 오류:', err);
    process.exit(1);
});

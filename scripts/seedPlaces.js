require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Place = require('../models/Place');
const ParkingInfo = require('../models/ParkingInfo');

const EXCEL_PATH = process.env.EXCEL_PATH;
const API_KEY = process.env.SEOUL_RTD_API;
const API_BASE = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/citydata/1/5`;
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
    const prkStts = cityData.PRK_STTS;
    if (prkStts) {
        const list = Array.isArray(prkStts) ? prkStts : [prkStts];
        const valid = list.filter((p) => p.LAT && p.LNG);
        if (valid.length > 0) {
            const lat = valid.reduce((sum, p) => sum + parseFloat(p.LAT), 0) / valid.length;
            const lng = valid.reduce((sum, p) => sum + parseFloat(p.LNG), 0) / valid.length;
            return { latitude: lat, longitude: lng };
        }
    }

    const busStts = cityData.BUS_STN_STTS;
    if (busStts) {
        const first = Array.isArray(busStts) ? busStts[0] : busStts;
        if (first.BUS_STN_X && first.BUS_STN_Y) {
            return {
                latitude: parseFloat(first.BUS_STN_Y),
                longitude: parseFloat(first.BUS_STN_X),
            };
        }
    }

    const chargerStts = cityData.CHARGER_STTS;
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

/**
 * PRK_STTS(주차장 현황)에서 각 주차장의 CUR_PRK_YN(현재 주차 가능 여부) 추출
 * API 필드명: PRK_STTS → 각 항목의 CUR_PRK_YN ('Y' / 'N')
 * @returns {Array<{prk_cd, prk_nm, cur_prk_yn, cur_prk_cnt}>}
 */
function extractParkingYN(cityData) {
    const prkStts = cityData.PRK_STTS;
    if (!prkStts) return [];

    const list = Array.isArray(prkStts) ? prkStts : [prkStts];

    return list.map((p) => ({
        prk_cd:      p.PRK_CD      || null,  // 주차장 코드
        prk_nm:      p.PRK_NM      || null,  // 주차장명
        cur_prk_yn:  p.CUR_PRK_YN  || null,  // 현재 주차 가능 여부 (Y/N)
        cur_prk_cnt: p.CUR_PRK_CNT != null   // 현재 주차 가능 면수
            ? parseInt(p.CUR_PRK_CNT, 10)
            : null,
    }));
}

async function fetchPlaceData(areaCd) {
    const url = `${API_BASE}/${areaCd}`;
    const response = await axios.get(url, { timeout: 10000 });
    const cityData = response.data['CITYDATA'];

    const coords = extractCoordinates(cityData);
    if (!coords) throw new Error('좌표 데이터 없음');

    const parkingList = extractParkingYN(cityData);
    return { ...coords, parkingList };
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB 연결 성공');

    const places = readPlacesFromExcel();
    console.log(`엑셀에서 ${places.length}개 장소 로드 완료\n`);

    let successCount = 0;
    let failCount = 0;

    for (const place of places) {
        const { AREA_CD, AREA_NM, ENG_NM, CATEGORY } = place;

        try {
            const { latitude, longitude, parkingList } = await fetchPlaceData(AREA_CD);

            await Place.findOneAndUpdate(
                { area_cd: AREA_CD },
                {
                    area_cd: AREA_CD,
                    category: CATEGORY,
                    name: AREA_NM,
                    eng_name: ENG_NM,
                    latitude,
                    longitude,
                },
                { upsert: true, new: true }
            );

            // ── 주차 가능 현황 집계 (CUR_PRK_YN === 'Y') ──────────────────────────
            const availableParking = parkingList.filter((p) => p.cur_prk_yn === 'Y');
            const prkAvailCount    = availableParking.length;
            const prkTotalCount    = parkingList.length;

            console.log(
                `[${successCount + 1}/${places.length}] ✓ ${AREA_NM}` +
                ` → 위도:${latitude.toFixed(6)}, 경도:${longitude.toFixed(6)}` +
                `, 주차가능:${prkAvailCount}/${prkTotalCount}개소`
            );

            // ── CUR_PRK_YN === 'Y' 인 주차장만 prk_cd 기준으로 ParkingInfo 갱신 ──
            // (createLivePark.js 로 먼저 ParkingInfo를 채운 뒤 실행해야 매칭됨)
            let prkUpdated = 0;
            for (const prk of availableParking) {
                if (!prk.prk_cd) continue;  // 코드 없는 항목 건너뜀

                const updated = await ParkingInfo.findOneAndUpdate(
                    { pklt_cd: prk.prk_cd },          // 주차장코드로 매칭
                    {
                        cur_prk_yn:  prk.cur_prk_yn,  // 'Y'
                        cur_prk_cnt: prk.cur_prk_cnt, // 현재 주차 가능 대수
                    },
                    { new: true }
                );

                if (updated) {
                    console.log(
                        `    └ [갱신] ${updated.pklt_nm}` +
                        ` (코드:${prk.prk_cd}, 주차가능대수:${prk.cur_prk_cnt ?? '-'}대)`
                    );
                    prkUpdated++;
                } else {
                    // ParkingInfo에 아직 없는 주차장 (createLivePark 미실행 or 코드 불일치)
                    console.log(
                        `    └ [미매칭] ${prk.prk_nm ?? '이름없음'}` +
                        ` (코드:${prk.prk_cd}) — ParkingInfo 없음`
                    );
                }
            }

            if (prkTotalCount > 0) {
                console.log(`    → ParkingInfo 갱신: ${prkUpdated}/${prkAvailCount}건`);
            }
            // ────────────────────────────────────────────────────────────────────

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

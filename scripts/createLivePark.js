require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const ParkingInfo = require('../models/ParkingInfo');

const API_KEY = process.env.SEOUL_API_KEY || '516f6562436b79753932784c6f6568';
const API_BASE = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/GetParkingInfo`;
const BATCH_SIZE = 1000; // 한 번에 가져올 레코드 수

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// API 호출 함수 (start~end 범위)
async function fetchParkingInfo(start, end) {
    const url = `${API_BASE}/${start}/${end}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data['GetParkingInfo'];
}

// DB 저장 함수
async function saveParkingInfo(rows) {
    let updateCount = 0;
    let insertCount = 0;

    for (const row of rows) {
        const result = await ParkingInfo.findOneAndUpdate(
            { pklt_cd: row.PKLT_CD },
            {
                pklt_cd:          row.PKLT_CD,
                pklt_nm:          row.PKLT_NM,
                addr:             row.ADDR,
                prk_stts_yn:      row.PRK_STTS_YN,
                now_prk_vhcl_cnt: row.NOW_PRK_VHCL_CNT ?? 0,
            },
            { upsert: true, new: true }
        );
        result.__v === 0 ? insertCount++ : updateCount++;
    }

    return { updateCount, insertCount };
}

async function createLivePark() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB 연결 성공');

    // 1. 전체 건수 확인 (1건만 조회)
    const firstBatch = await fetchParkingInfo(1, 1);
    const totalCount = firstBatch.list_total_count;
    console.log(`총 주차장 수: ${totalCount}개\n`);

    let totalInsert = 0;
    let totalUpdate = 0;

    // 2. BATCH_SIZE 단위로 페이지네이션
    for (let start = 1; start <= totalCount; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, totalCount);
        console.log(`[${start} ~ ${end}] 데이터 가져오는 중...`);

        const data = await fetchParkingInfo(start, end);
        const rows = data.row;

        if (!rows || rows.length === 0) {
            console.log('  → 데이터 없음, 건너뜀');
            continue;
        }

        const { updateCount, insertCount } = await saveParkingInfo(rows);
        totalInsert += insertCount;
        totalUpdate += updateCount;
        console.log(`  → 저장 완료 (신규: ${insertCount}, 갱신: ${updateCount})`);

        await sleep(300); // API 부하 방지
    }

    console.log(`\n완료: 신규 ${totalInsert}개 / 갱신 ${totalUpdate}개`);
    await mongoose.disconnect();
}

createLivePark().catch((err) => {
    console.error('오류:', err.message);
    process.exit(1);
});

const cron = require('node-cron');
const { updateAllCongestion } = require('../services/placeApiService');

let isRunning = false;

function start() {
    // 10분마다 실행 (서울 실시간 API가 ~5분 간격 갱신)
    cron.schedule('*/10 * * * *', async () => {
        if (isRunning) {
            console.log('[혼잡도 스케줄러] 이전 작업 진행 중, 건너뜀');
            return;
        }
        isRunning = true;
        const now = new Date().toLocaleTimeString('ko-KR');
        console.log(`[혼잡도 스케줄러] ${now} 갱신 시작`);
        try {
            await updateAllCongestion();
        } catch (err) {
            console.error('[혼잡도 스케줄러] 오류:', err.message);
        } finally {
            isRunning = false;
        }
    });

    console.log('[혼잡도 스케줄러] 등록 완료 — 10분 간격으로 서울 API 갱신');
}

module.exports = { start };

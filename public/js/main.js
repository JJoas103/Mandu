const appDiv = document.getElementById('markerInfo');
const initialMarkerInfo = JSON.parse(appDiv.dataset.markers);

const mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 8
};
const map = new kakao.maps.Map(document.getElementById('map'), mapOption);

const MK_IMAGES = {
    '혼잡':     './images/marker_crowdede.png',
    '약간 붐빔': './images/marker_little_crowded.png',
    '보통':     './images/marker_normal.png',
};
const MK_DEFAULT = './images/marker_available.png';
const imageSize = new kakao.maps.Size(50, 50);

let activeMarkers = [];

function renderMarkers(positions) {
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers = [];

    positions.forEach(pos => {
        const imageSrc = MK_IMAGES[pos.congest_lvl] || MK_DEFAULT;
        const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(pos.latitude, pos.longitude),
            title: pos.name,
            image: new kakao.maps.MarkerImage(imageSrc, imageSize)
        });
        kakao.maps.event.addListener(marker, 'click', () => {
            window.location.href = '/place/' + pos.area_cd;
        });
        activeMarkers.push(marker);
    });
}

function updateSurgeList(surgeList) {
    const ul = document.getElementById('surgeList');
    if (!ul) return;
    ul.innerHTML = surgeList.map(s =>
        `<li class="list-group-item d-flex justify-content-between">
            <span>${s.area_nm}</span>
            <span class="text-danger fw-bold">${s.surge_pct}%</span>
        </li>`
    ).join('');
}

function updateCongestList(congestList) {
    const ul = document.getElementById('congestList');
    if (!ul) return;
    ul.innerHTML = congestList.map(c =>
        `<li class="list-group-item d-flex justify-content-between">
            <span>${c.area_nm}</span>
            <span class="text-danger fw-bold">${c.area_congest_lvl}</span>
        </li>`
    ).join('');
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (!el) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `갱신 ${hh}:${mm}`;
}

async function refreshCongestion() {
    try {
        const res = await fetch('/api/congestion');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderMarkers(data.markerInfo);
        updateSurgeList(data.surgePlace);
        updateCongestList(data.congestPlaceTopFive);
        updateLastUpdated();
    } catch (e) {
        console.warn('혼잡도 갱신 실패:', e.message);
    }
}

// 초기 렌더링
renderMarkers(initialMarkerInfo);
updateLastUpdated();

// 5분마다 자동 갱신
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
setInterval(refreshCongestion, REFRESH_INTERVAL_MS);

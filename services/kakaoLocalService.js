const axios = require('axios');

const KAKAO_LOCAL_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const KAKAO_GEO_URL = 'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json';
const SEOUL_API_BASE = 'http://openapi.seoul.go.kr:8088';
const headers = { Authorization: `KakaoAK ${process.env.KAKAO_REST_API}` };

const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getNearbyParking = async (lat, lng) => {
    try {
        const response = await axios.get(KAKAO_LOCAL_URL, {
            headers,
            params: { query: '주차장', y: lat, x: lng, radius: 500, size: 5 }
        });
        return response.data.documents || [];
    } catch (e) {
        console.warn('주차장 API 호출 실패:', e.message);
        return [];
    }
};

const getNearbyRestrooms = async (lat, lng) => {
    // 1단계: 카카오 키워드 검색 (반경 1000m, 다중 키워드 시도)
    for (const keyword of ['공중화장실', '화장실', '공용화장실']) {
        try {
            const response = await axios.get(KAKAO_LOCAL_URL, {
                headers,
                params: { query: keyword, y: lat, x: lng, radius: 1000, size: 5 }
            });
            const docs = response.data.documents || [];
            if (docs.length > 0) return docs;
        } catch (e) {
            console.warn(`카카오 화장실(${keyword}) API 호출 실패:`, e.message);
        }
    }

    // 2단계: 서울 열린데이터광장 PUBLOILET API (카카오에 등록 안 된 공중화장실 보완)
    try {
        const geoRes = await axios.get(KAKAO_GEO_URL, {
            headers,
            params: { x: lng, y: lat }
        });
        const region = geoRes.data.documents?.[0];
        const dongName = region?.region_3depth_name || region?.region_2depth_name;
        if (!dongName) return [];

        const seoulRes = await axios.get(
            `${SEOUL_API_BASE}/${process.env.SEOUL_RTD_API}/json/PUBLOILET/1/20/${encodeURIComponent(dongName)}`
        );
        const rows = seoulRes.data?.PUBLOILET?.row || [];

        return rows
            .filter(r => r.Y_WGS84 && r.X_WGS84)
            .map(r => ({
                place_name: r.FNAME || '공중화장실',
                road_address_name: r.ADDR1 || '',
                address_name: r.ADDR1 || '',
                distance: String(calcDistance(lat, lng, parseFloat(r.Y_WGS84), parseFloat(r.X_WGS84)))
            }))
            .filter(r => parseInt(r.distance) <= 1000)
            .sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
            .slice(0, 5);
    } catch (e) {
        console.warn('서울 화장실 API 호출 실패:', e.message);
        return [];
    }
};

const getNearbyTransit = async (lat, lng) => {
    try {
        let response = await axios.get(KAKAO_LOCAL_URL, {
            headers,
            params: { query: '지하철역', y: lat, x: lng, radius: 2000, size: 1 }
        });
        if (response.data.documents.length > 0) {
            const s = response.data.documents[0];
            return { name: s.place_name, distance: s.distance, type: '지하철역' };
        }
        response = await axios.get(KAKAO_LOCAL_URL, {
            headers,
            params: { query: '버스정류장', y: lat, x: lng, radius: 1000, size: 1 }
        });
        if (response.data.documents.length > 0) {
            const s = response.data.documents[0];
            return { name: s.place_name, distance: s.distance, type: '버스정류장' };
        }
        return null;
    } catch (e) {
        console.warn('대중교통 API 호출 실패:', e.message);
        return null;
    }
};

const getPlaceImage = async (placeName) => {
    return `/images/places/${encodeURIComponent(placeName)}.jpg`;
};

module.exports = { getNearbyParking, getNearbyRestrooms, getNearbyTransit, getPlaceImage };

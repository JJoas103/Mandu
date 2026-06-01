const axios = require('axios');

const KAKAO_LOCAL_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const headers = { Authorization: `KakaoAK ${process.env.KAKAO_REST_API}` };

async function getNearbyParking(lat, lng) {
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
}

async function getNearbyRestrooms(lat, lng) {
    try {
        const response = await axios.get(KAKAO_LOCAL_URL, {
            headers,
            params: { query: '공중화장실', y: lat, x: lng, radius: 500, size: 5 }
        });
        return response.data.documents || [];
    } catch (e) {
        console.warn('화장실 API 호출 실패:', e.message);
        return [];
    }
}

async function getNearbyTransit(lat, lng) {
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
}

async function getPlaceImage(placeName) {
    try {
        const response = await axios.get('https://dapi.kakao.com/v2/search/image', {
            headers,
            params: { query: `${placeName} 서울 풍경`, size: 1 }
        });
        const docs = response.data.documents;
        return docs.length > 0 ? docs[0].thumbnail_url : null;
    } catch (e) {
        console.warn('이미지 API 호출 실패:', e.message);
        return null;
    }
}

module.exports = { getNearbyParking, getNearbyRestrooms, getNearbyTransit, getPlaceImage };

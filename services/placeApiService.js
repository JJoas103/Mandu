// const Place = require('../models/place');
// const axios = require('axios');

// const API_KEY = process.env.SEOUL_API_KEY || '516f6562436b79753932784c6f6568';
// const API_BASE = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/citydata/1/5`;


// async function getRelaxedPlaces() {
//     const response = await axios.get(API_BASE);
//     //JSON 응답에서 도시데이터 목록 꺼내기
//     const cityDataList = response.data['SeoulRtd.citydata']['CITYDATA'];
//     console.log(cityDataList);
//     const list = Array.isArray(cityDataList) ? cityDataList : [cityDataList];
//     //이름과 혼잡도 추출
//     return list.map(cityData => ({
//         name: cityData.AREA_NM,
//         congest_lvl: cityData.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_CONGEST_LVL
//     }));    
// }


// module.exports = { getRelaxedPlaces };


//api 호출 예시
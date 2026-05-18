const axios = require('axios');

async function getCityData(areaNm) {
    const apiKey = process.env.SEOUL_RTD_API;
    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata/1/1/${encodeURIComponent(areaNm)}`;

    const response = await axios.get(url);
    const data = response.data.CITYDATA;
    return data;
}

module.exports = { getCityData };

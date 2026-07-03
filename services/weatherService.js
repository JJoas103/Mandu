const axios = require('axios');

const WEATHER_DESC = {
    'Sunny': '맑음', 'Clear': '맑음', 'Partly cloudy': '구름 조금',
    'Cloudy': '흐림', 'Overcast': '흐림', 'Mist': '안개',
    'Fog': '안개', 'Light rain': '가벼운 비', 'Moderate rain': '비',
    'Heavy rain': '강한 비', 'Light snow': '가벼운 눈', 'Moderate snow': '눈',
    'Heavy snow': '강한 눈', 'Thundery outbreaks': '천둥번개', 'Blizzard': '눈보라'
};

const getWeather = async (lat, lng) => {
    try {
        const response = await axios.get(`https://wttr.in/${lat},${lng}?format=j1`, {
            timeout: 5000,
            headers: { 'Accept': 'application/json' }
        });
        const cond = response.data.current_condition[0];
        const tempC = cond.temp_C;
        const descEn = cond.weatherDesc[0].value;
        const desc = WEATHER_DESC[descEn] || descEn;
        return { tempC, desc };
    } catch (e) {
        console.warn('날씨 API 호출 실패:', e.message);
        return null;
    }
};

module.exports = { getWeather };

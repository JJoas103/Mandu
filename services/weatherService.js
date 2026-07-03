const axios = require('axios');

const WEATHER_DESC = {
    'sunny': '맑음', 'clear': '맑음', 'partly cloudy': '구름 조금',
    'cloudy': '흐림', 'overcast': '흐림', 'mist': '안개',
    'fog': '안개', 'light rain': '가벼운 비', 'moderate rain': '비',
    'heavy rain': '강한 비', 'light snow': '가벼운 눈', 'moderate snow': '눈',
    'heavy snow': '강한 눈', 'thundery outbreaks': '천둥번개', 'blizzard': '눈보라'
};

const getWeather = async (lat, lng) => {
    try {
        const response = await axios.get(`https://wttr.in/${lat},${lng}?format=j1`, {
            timeout: 5000,
            headers: { 'Accept': 'application/json' }
        });
        const cond = response.data.current_condition[0];
        const tempC = cond.temp_C;
        const descEn = cond.weatherDesc[0].value.trim();
        const desc = WEATHER_DESC[descEn.toLowerCase()] || descEn;
        return { tempC, desc };
    } catch (e) {
        console.warn('날씨 API 호출 실패:', e.message);
        return null;
    }
};

module.exports = { getWeather };

const axios = require('axios');
const xml2js = require('xml2js');

async function getLocation() {
    const url = 'http://openapi.seoul.go.kr:8088/516f6562436b79753932784c6f6568/xml/citydata/1/5/POI001';
    
    try {
        const response = await axios.get(url);
        const xmlData = response.data;
        console.log('--- XML 원본 데이터 ---');
        //console.log(xmlData);

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(xmlData, (err, result) => {
            if(err) {
                console.log('파싱 에러', err);
            } else {
                const root = result['SeoulRtd.citydata'];
                const cityData = result['SeoulRtd.citydata']['CITYDATA']['PRK_STTS'];
                
                cityData.PRK_STTS.forEach(element => {
                    const lat = element['LAT'];
                    const lng = element['LNG'];
                    console.log('위도', lat);
                    console.log('경도', lng);

                });
            }
        });
    } catch(error) {
        console.error('API 호출 에러', error);
    }
}

getLocation();
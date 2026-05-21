/* Node.js 12 샘플 코드 */

var request = require('request');

var url = 'http://openapi.seoul.go.kr:8088/pro/xml/citydata/1/5/광화문·덕수궁';

request({
	url: url,
	method: 'GET'
}, function (error, response, body) {
	//console.log('Status', response.statusCode);
	//console.log('Headers', JSON.stringify(response.headers));
	//console.log('Reponse received', body);
});
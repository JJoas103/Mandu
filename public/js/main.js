const appDiv = document.getElementById('markerInfo');
const markerInfo = JSON.parse(appDiv.dataset.markers);

console.log(markerInfo);
var mapContainer = document.getElementById('map');

const lat = 37.5665;
const lng = 126.9780;
var mapOption = {
    center : new kakao.maps.LatLng(lat, lng),
    level : 8
};
var map = new kakao.maps.Map(mapContainer, mapOption);	//지도 생성


//마커표시 객체배열
var positions = markerInfo.map(function(p) {
    return {
        title: p.name,
        latlng: new kakao.maps.LatLng(p.latitude, p.longitude),
        congest_lvl: p.congest_lvl
    };
});

var mk_img_available = "./images/marker_available.png";
var mk_img_normal = "./images/marker_normal.png";
var mk_img_little_crowded = "./images/marker_little_crowded.png";
var mk_img_crowded = "./images/marker_crowdede.png";


//마커 표시 
for(var i=0; i< positions.length; i++){
    //마커 이미지의 이미지크기
    var imageSize = new kakao.maps.Size(24,35);
    //마커 이미지 생성
    if(positions[i].congest_lvl == '혼잡'){
        var markerImage = new kakao.maps.MarkerImage(mk_img_crowded, imageSize);
    } else if(positions[i].congest_lvl == '약간 붐빔'){
        var markerImage = new kakao.maps.MarkerImage(mk_img_little_crowded, imageSize);
    } else if(positions[i].congest_lvl == '보통'){
        var markerImage = new kakao.maps.MarkerImage(mk_img_normal, imageSize);
    } else if(positions[i].congest_lvl == '여유'){
        var markerImage = new kakao.maps.MarkerImage(mk_img_available, imageSize);
    }
    var marker = new kakao.maps.Marker({
        map: map,
        position: positions[i].latlng,
        title: positions[i].title,
        image: markerImage
    });
        
}


marker.setMap(map);

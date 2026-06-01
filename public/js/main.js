const appDiv = document.getElementById('markerInfo');
const markerInfo = JSON.parse(appDiv.dataset.markers);

var mapContainer = document.getElementById('map');

const lat = 37.5665;
const lng = 126.9780;
var mapOption = {
    center : new kakao.maps.LatLng(lat, lng),
    level : 8
};
var map = new kakao.maps.Map(mapContainer, mapOption);

var positions = markerInfo.map(function(p) {
    return {
        title: p.name,
        area_cd: p.area_cd,
        latlng: new kakao.maps.LatLng(p.latitude, p.longitude),
        congest_lvl: p.congest_lvl
    };
});

var mk_img_available = "./images/marker_available.png";
var mk_img_normal = "./images/marker_normal.png";
var mk_img_little_crowded = "./images/marker_little_crowded.png";
var mk_img_crowded = "./images/marker_crowdede.png";

var imageSize = new kakao.maps.Size(50, 50);

for (var i = 0; i < positions.length; i++) {
    var markerImage;
    if (positions[i].congest_lvl == '혼잡') {
        markerImage = new kakao.maps.MarkerImage(mk_img_crowded, imageSize);
    } else if (positions[i].congest_lvl == '약간 붐빔') {
        markerImage = new kakao.maps.MarkerImage(mk_img_little_crowded, imageSize);
    } else if (positions[i].congest_lvl == '보통') {
        markerImage = new kakao.maps.MarkerImage(mk_img_normal, imageSize);
    } else {
        markerImage = new kakao.maps.MarkerImage(mk_img_available, imageSize);
    }

    var marker = new kakao.maps.Marker({
        map: map,
        position: positions[i].latlng,
        title: positions[i].title,
        image: markerImage
    });

    (function(m, pos) {
        kakao.maps.event.addListener(m, 'click', function() {
            window.location.href = '/place/' + pos.area_cd;
        });
    })(marker, positions[i]);
}

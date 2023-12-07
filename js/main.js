// 1. สร้างแผนที่ Leaflet
var map = L.map('map').setView([14.05000, 100.48333], 12);

// 2. เพิ่ม Tile Layer (ตัวแปร CSS ของแผนที่)
var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.geoJson(statesData).addTo(map);
// 3. ดึงข้อมูล GeoJSON จากไฟล์หรือ API
var yourGeoJSONData; // เก็บข้อมูล GeoJSON ที่ได้มา

// 4. สร้างแผนที่ Choropleth ด้วย D3.js
d3.json('Map_Phathum.geojson').then(function (data) {
    yourGeoJSONData = data;

    L.geoJSON(yourGeoJSONData, {
        style: function (feature) {
            // ตั้งสีของแต่ละพื้นที่ตามข้อมูล
            var value = feature.properties.coordinates; // แก้ตามชื่อ property ที่เกี่ยวข้อง
            return {
                fillColor: getColor(value),
                weight: 2,
                opacity: 1,
                color: 'black',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function (feature, layer) {
            // เพิ่ม Popup
            layer.bindPopup(feature.properties.name + ': ' + feature.properties.coordinates); // แก้ตามชื่อ property ที่เกี่ยวข้อง
        }
    }).addTo(map);
});

// 5. สร้างฟังก์ชั่นเลือกสี
function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500 ? '#BD0026' :
           d > 200 ? '#E31A1C' :
           d > 100 ? '#FC4E2A' :
                     '#FFEDA0';
}

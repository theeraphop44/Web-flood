// Map Initialization
var map = L.map('map').setView([14.05000, 100.48333], 10);

// Tile Layer
var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var geojson; // Declare geojson variable

// Update Map
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    var contents = props ? `<b>${props.name}</b><br />${props.value} people / mi<sup>2</sup>` : 'Hover over a state';
    this._div.innerHTML = `<h4>Phathum Population Value</h4>${contents}`;
};

info.addTo(map);

// GeoJSON Data Fetch
fetch("Map_Phathum.geojson")
    .then(response => response.json())
    .then(data => {
        // Create a GeoJSON layer
        geojson = L.geoJSON(data, {
            style: function (feature) {
                var value = feature.properties.value;
                return {
                    fillColor: getColor(value),
                    weight: 2,
                    opacity: 1,
                    color: 'blue',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('Region: ' + feature.properties.name + '<br>Value: ' + feature.properties.value);
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            },
        }).addTo(map);
        console.log(data);
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

// Color function
function getColor(e) {
    return e > 20 ? 'red' :
        e > 10 ? 'rgb(255, 157, 0)' :
            e > 5 ? 'rgb(255, 242, 0)' :
                e > 2 ? 'rgb(4, 255, 0)' :
                    'rgb(4, 255, 0)';
}

// Style function
function style(feature) {
    return {
        fillColor: getColor(feature.properties.value),
        weight: 2,
        opacity: 1,
        color: 'blue',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

let isZoomed = false; // เพิ่มตัวแปร isZoomed

function zoomToFeature(e) {
    var layer = e.target;
    var properties = layer.feature.properties;

    if (isZoomed && map.getBounds().equals(layer.getBounds())) {
        isZoomed = false;
        return;
    }

    // ตรวจสอบว่าคลิกที่ feature อื่นหรือไม่
    if (isZoomed) {
        isZoomed = false;
    }

    // Show data in the table
    const tableData = [
        { num: 1, location: properties.name, waterLevel: "1", status: properties.value, time: "3" },
        // Add more rows as needed
    ];

    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Add new rows to the table
    tableData.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add(item.num % 2 === 0 ? 'TableRow-b' : 'TableRow-w');

        Object.entries(item).forEach(([key, value]) => {
            if (key !== 'num') {
                const cell = document.createElement('td');
                cell.classList.add('TableCell-body');
                cell.textContent = value;
                row.appendChild(cell);
            }
        });

        tableBody.appendChild(row);
    });

    map.fitBounds(layer.getBounds());

    // ทำเครื่องหมายว่ามีการ zoom แล้ว
    isZoomed = true;
}

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [2, 5, 10, 20];
    const labels = [];
    let from, to;

    for (let i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);


const data = [
    { num: 1, location: "", waterLevel: "", status: "", time: "" },
    
];

const tableBody = document.querySelector('.TableBody');
const tableHead = document.querySelector('.TableHead');

// สร้าง <th> สำหรับแต่ละ property
const headerRow = document.createElement('tr');
Object.keys(data[0]).forEach(key => {
    if (key !== 'num') {
        const headerCell = document.createElement('th');
        headerCell.classList.add('TableCell-head');
        headerCell.innerHTML = `<span class="ButtonBase">${key}</span>`;
        headerRow.appendChild(headerCell);
    }
});

// เพิ่ม <th> ลงใน thead
tableHead.appendChild(headerRow);

// สร้าง <tr> สำหรับแต่ละรายการใน data
data.forEach(item => {
    const row = document.createElement('tr');
    row.classList.add(item.num % 2 === 0 ? 'TableRow-b' : 'TableRow-w');

    // สร้าง <td> สำหรับแต่ละ property โดยไม่รวม 'num'
    Object.entries(item).forEach(([key, value]) => {
        if (key !== 'num') {
            const cell = document.createElement('td');
            cell.classList.add('TableCell-body');
            cell.textContent = value;
            row.appendChild(cell);
        }
    });

    // เพิ่ม <tr> ลงใน tbody
    tableBody.appendChild(row);
});

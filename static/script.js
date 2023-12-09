var map = L.map('map').setView([13.80838, 100.49487], 10);

// Tile Layer
var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


let geojson;

// Color function
function getColor(e) {
    return e > 100 ? 'red' :
        e > 70 ? 'blue' :
            e > 30 ? 'rgb(8, 206, 28)' :
                'rgb(252, 236, 55)';
}

async function someName() {

    defaut_show("ธัญบุรี", "ฟิวเจอร์ฯรังสิต")
    const waterLevel = await fetch("/api/waterlevel", { method: 'GET', redirect: 'follow' });
    const waterLevelResp = await waterLevel.json();

    const response = await fetch("Map_Phathum.geojson");
    const data = await response.json();

    geojson = L.geoJSON(data, {
        style: function (feature) {
            const thisStation = waterLevelResp.data.find(o => (o.geocode.amphoe_name === feature.properties.name));
            if (!thisStation) {
                // console.log(feature);
            }
            //    console.log(thisStation);
            return {
                fillColor: getColor(thisStation.storage.percent), // นำค่า value ไปใช้กับ getColor() เพื่อกำหนดสี
                weight: 2,
                opacity: 1,
                color: 'black',
                dashArray: '3',
                fillOpacity: 0.7
            };

        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup('Region: ' + feature.properties.name);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            })
        }

    }).addTo(map);

}

someName()

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

async function defaut_show(loca, station) {
    const rain = await fetch("api/rainlevel", { method: 'GET', redirect: 'follow' });
    const rainResp = await rain.json();
    const waterLevel = await fetch("api/waterlevel", { method: 'GET', redirect: 'follow' });
    const waterLevelResp = await waterLevel.json();
    const thisStation = waterLevelResp.data.find(o => (o.geocode.amphoe_name === loca));

    console.log(thisStation);

    const name = thisStation.geocode.amphoe_name;
    const water_level = thisStation.waterlevel_msl;
    const msl = thisStation.waterlevel_bank.msl;
    const statusofwater = thisStation.storage.situation_text;
    const update_water = thisStation.update_at;
    const storagepercent = thisStation.storage.percent;


    const statuslevelwater_name = document.getElementById('statuslevelwater-name');
    statuslevelwater_name.textContent = ` ${name}`;

    const statuslevelwater_waterlevel = document.getElementById('statuslevelwater-waterlevel');
    statuslevelwater_waterlevel.textContent = `ระดับตลิ่ง : ${water_level}ม.`;

    const statuslevelwater_bank = document.getElementById('statuslevelwater-bank');
    statuslevelwater_bank.textContent = `ระดับน้ำ : ${msl}ม.`;

    const statuslevelwater_status = document.getElementById('statuslevelwater-status');
    statuslevelwater_status.textContent = `${statusofwater}`;

    if (storagepercent > 100) {
        statuslevelwater_status.style.backgroundColor = "red";
    } else if (storagepercent > 70) {
        statuslevelwater_status.style.backgroundColor = "blue";
    } else if (storagepercent > 30) {
        statuslevelwater_status.style.backgroundColor = "rgb(8, 206, 28)";
    } else {
        statuslevelwater_status.style.backgroundColor = "rgb(252, 236, 55)";
    }
    statuslevelwater_status.style.color = "white";

    const statuslevelwater_date = document.getElementById('statuslevelwater-date');
    statuslevelwater_date.textContent = `วันที่ : ${update_water}`;


    const thisrainStation = rainResp.data.find(o => (o.station.name === station));

    const tableData = thisrainStation.rain7d.map((data, index) => ({
        num: index + 1,
        date: data.date,
        situation: data.rain.situation_text,
    }));

    const currentRainSituation = thisrainStation.current_rain.situation_text;
    const rain_collection = thisrainStation.rain_collection;

    // แสดงข้อมูลจาก rain_collection ใน HTML
    const rainCollection1dElement = document.getElementById('rainCollection1d');
    const rainCollection3dElement = document.getElementById('rainCollection3d');
    const rainCollection7dElement = document.getElementById('rainCollection7d');

    // แสดงข้อมูล rain_collection ใน HTML
    rainCollection1dElement.textContent = `${rain_collection["1d"]}`;
    rainCollection3dElement.textContent = `${rain_collection["3d"]}`;
    rainCollection7dElement.textContent = `${rain_collection["7d"]}`;

    // แสดง icon
    const currentRainIconElement = document.getElementById('currentRainIcon');
    const currentRainTextElement = document.getElementById('currentRainText');


    switch (currentRainSituation) {
        case 'ไม่มีฝน':
            currentRainIconElement.textContent = '☀️';
            break;
        case 'มีฝน':
            currentRainIconElement.textContent = '🌧️';
            break;
        case 'ฝนตกเล็กน้อย':
            currentRainIconElement.textContent = '🌦️';
            break;
        default:
            currentRainIconElement.textContent = '❓';
    }

    // แสดงข้อความ
    currentRainTextElement.textContent = currentRainSituation;

    // ทำการ sort ข้อมูล tableData ตาม date
    tableData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add new rows to the table
    tableBody.innerHTML = '';

    // Add new rows to the table
    tableData.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add(item.num % 2 === 0 ? 'TableRow-b' : 'TableRow-w');

        // Create cell for date
        const dateCell = document.createElement('td');
        dateCell.classList.add('TableCell-body');
        dateCell.textContent = item.date;
        row.appendChild(dateCell);

        // Create cell for situation icon
        const situationCell = document.createElement('td');
        situationCell.classList.add('TableCell-body');

        // Create icon span
        const icon = document.createElement('span');

        switch (item.situation) {
            case 'ไม่มีฝน':
                icon.textContent = '☀️'; // ตัวอย่าง icon สำหรับไม่มีฝน (แดด)
                break;
            case 'มีฝน':
                icon.textContent = '🌧️'; // ตัวอย่าง icon สำหรับมีฝน
                break;
            case 'ฝนตกเล็กน้อย':
                icon.textContent = '🌦️'; // ตัวอย่าง icon สำหรับฝนตกเล็กน้อย
                break;
            // เพิ่ม case ตามสภาพอากาศอื่น ๆ ตามต้องการ
            default:
                icon.textContent = '❓'; // ตัวอย่าง icon สำหรับสภาพอากาศที่ไม่ทราบ
        }

        situationCell.appendChild(icon);
        row.appendChild(situationCell);

        // Create cell for situation text
        const situationTextCell = document.createElement('td');
        situationTextCell.classList.add('TableCell-body');
        situationTextCell.textContent = item.situation;
        row.appendChild(situationTextCell);

        tableBody.appendChild(row);
    });
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

let isZoomed = false; // เพิ่มตัวแปร isZoomed

async function zoomToFeature(e) {
    if (e) {
        var layer = e.target;
        var properties = layer.feature.properties;

        if (properties.name == "ธัญบุรี") {
            xx = "ฟิวเจอร์ฯรังสิต"
        } else if (properties.name == "หนองเสือ") {
            xx = "คลองระพีพัฒน์แยกใต้ หนองเสือ"
        } else if (properties.name == "เมืองปทุมธานี") {
            xx = "คลองเปรมประชากร หลักหก"
        } else if (properties.name == "คลองหลวง") {
            xx = "คลองระพีพัฒน์แยกตก"
        } else if (properties.name == "ลำลูกกา") {
            xx = "คลองหกวา ลำลูกกา คลอง8"
        }

        if (isZoomed && map.getBounds().equals(layer.getBounds())) {
            isZoomed = false;
            return;
        }

        // ตรวจสอบว่าคลิกที่ feature อื่นหรือไม่
        if (isZoomed) {
            isZoomed = false;
        }

    }
    defaut_show(properties.name, xx);
    // If e is not null, fit bounds to the layer
    if (e) {
        map.fitBounds(layer.getBounds());

        // ทำเครื่องหมายว่ามีการ zoom แล้ว
        isZoomed = true;
    }
}


map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 30, 70, 100];
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
    { num: 1, Day: "", สภาพอากาศ: "", สถานะ: "" },
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


const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', function () {

        this.style.background = '#ff0000';

        // อย่าลืมดำเนินการอื่นๆ ตามที่คุณต้องการ
    });
});
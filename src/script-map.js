// Map Initialization
const map = L.map('map').setView([14.05000, 100.48333], 10);

// Tile Layer
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Color function
function getColor(e) {
    return  e > 20 ? 'red' :
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

// GeoJSON Data Fetch
let geojson;

fetch("Map_Phathum.geojson")
    .then(response => response.json())
    .then(data => {
        geojson = L.geoJSON(data, {
            style: function (feature) {
                const value = feature.properties.value;
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
            }
        }).addTo(map);
        console.log(data);
    })
    .catch(error => console.error("Error loading GeoJSON:", error));

// Highlight Feature
function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}

// Reset Highlight
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

// Zoom to Feature
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Event Listeners and Legend
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
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

// Update Map
const info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    const contents = props ? `<b>${props.name}</b><br />${props.value} people / mi<sup>2</sup>` : 'Hover over a state';
    this._div.innerHTML = `<h4>Phathum Population Value</h4>${contents}`;
};

info.addTo(map);
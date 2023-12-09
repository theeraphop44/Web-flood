/* Dependencies */
const express = require('express');
const path = require('path');
const { DateTime } = require('luxon');

/* Variable */
const app = express();

/* Router */
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './html', 'index.html'));
});

app.get('/api/waterlevel', async ({ query }, res) => {
	const selectedProvince = query.province ? String(query.province) : "13";

	// Query the API
	const response = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/waterlevel?province_code=` + selectedProvince )).json());

	// Filter the data
	const filteredData = response.data
		.map((o) => ({
			id: o.id,
			station: {
				name: (o.station.tele_station_name['th'] || o.station.tele_station_name['en']),
				lat: o.station.tele_station_lat,
				lng: o.station.tele_station_long,
			},
			geocode: {
				area_code: o.geocode.area_code,
				area_name: o.geocode.area_name['th'] || o.geocode.area_name['en'],
				amphoe_code: o.geocode.amphoe_code,
				amphoe_name: o.geocode.amphoe_name['th'] || o.geocode.amphoe_name['en'],
				tumbon_code: o.geocode.tumbon_code,
				tumbon_name: o.geocode.tumbon_name['th'] || o.geocode.tumbon_name['en'],
				province_code: o.geocode.province_code,
				province_name: o.geocode.province_name['th'] || o.geocode.province_name['en'],
			},
			waterlevel_msl: o.waterlevel_msl,
			waterlevel_bank: {
				msl: o.diff_wl_bank,
				situation: o.diff_wl_bank_text,
			},
			storage: {
				percent: o.storage_percent,
				situation: parseFloat(o.storage_percent) <= 10.00 ? 0
					: parseFloat(o.storage_percent) <= 30.00 ? 1
					: parseFloat(o.storage_percent) <= 70.00 ? 2
					: parseFloat(o.storage_percent) <= 100.00 ? 3 : 4,
				situation_text: parseFloat(o.storage_percent) <= 10.00 ? "น้ำน้อยวิกฤต"
					: parseFloat(o.storage_percent) <= 30.00 ? "น้ำน้อย"
					: parseFloat(o.storage_percent) <= 70.00 ? "น้ำปกติ"
					: parseFloat(o.storage_percent) <= 100.00 ? "น้ำมาก" : "น้ำล้นตลิ่ง",
			},
			update_at: DateTime.fromFormat(o.waterlevel_datetime, 'yyyy-MM-dd HH:mm')
				.plus({ years: 543 })
				.toFormat('dd/MM/yyyy HH:mm')
		})
	);

	// Return the data
    return res.json({ result: true, data: filteredData });
});

app.get('/api/rainlevel', async ({ query }, res) => {
	const selectedProvince = query.province ? String(query.province) : "13";

	// Query the API
	const response24 = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/rain24?province_code=` + selectedProvince )).json());
	const response1d = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/rain1d?province_code=` + selectedProvince )).json());
	const response3d = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/rain3d?province_code=` + selectedProvince )).json());
	const response7d = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/rain7d?province_code=` + selectedProvince )).json());

	// Filter the data
	const filteredData = response24.data
		.map((o) => ({
			id: o.station.id,
			station: {
				name: (o.station.tele_station_name['th'] || o.station.tele_station_name['en']),
				lat: o.station.tele_station_lat,
				lng: o.station.tele_station_long,
			},
			current_rain: {
				mm: o.rain_24h,
				situation: parseFloat(o.rain_24h) > 0 ? 1
					: parseFloat(o.rain_24h) > 10.00 ? 2
					: parseFloat(o.rain_24h) > 35.00 ? 3
					: parseFloat(o.rain_24h) > 90.00 ? 4
					: 0,
				situation_text: parseFloat(o.rain_24h) > 0 ? "ฝนตกเล็กน้อย"
					: parseFloat(o.rain_24h) > 10.00 ? "ฝนตกปานกลาง"
					: parseFloat(o.rain_24h) > 35.00 ? "ฝนตกหนัก"
					: parseFloat(o.rain_24h) > 90.00 ? "ฝนตกหนักมาก"
					: "ไม่มีฝน",
			},
			rain_collection: {
				'1d': response1d.data.find(o1d => o1d.station.id === o.station.id) ? parseFloat(response1d.data.find(o1d => o1d.station.id === o.station.id).rain_1d) : 0.00,
				'3d': response3d.data.find(o3d => o3d.station.id === o.station.id) ? parseFloat(response3d.data.find(o3d => o3d.station.id === o.station.id).rain_3d) : 0.00,
				'7d': response7d.data.find(o7d => o7d.station.id === o.station.id) ? parseFloat(response7d.data.find(o7d => o7d.station.id === o.station.id).rain_7d) : 0.00,
			},
			rain7d: [],
			update_at: DateTime.fromFormat(o.rainfall_datetime, 'yyyy-MM-dd HH:mm')
				.plus({ years: 543 })
				.toFormat('dd/MM/yyyy HH:mm')
		})
	);

	for (const station of filteredData) {
		const graphData = (await (await fetch(`https://api-v3.thaiwater.net/api/v1/thaiwater30/iframe/rain24_graph?id=` + station.id)).json());
		if (graphData && graphData.result === 'OK' && graphData.data) {
			for (const data of graphData.data) {
				station.rain7d.push({
					date: DateTime.fromFormat(data.rainfall_datetime, 'yyyy-MM-dd')
						.plus({ years: 543 })
						.toFormat('dd/MM/yyyy'),
					rain: {
						mm: !!(data.rainfall_value) ? data.rainfall_value : 0,
						situation: parseFloat(data.rainfall_value) > 0 ? 1
							: parseFloat(data.rainfall_value) > 10.00 ? 2
							: parseFloat(data.rainfall_value) > 35.00 ? 3
							: parseFloat(data.rainfall_value) > 90.00 ? 4
							: 0,
						situation_text: parseFloat(data.rainfall_value) > 0 ? "ฝนตกเล็กน้อย"
							: parseFloat(data.rainfall_value) > 10.00 ? "ฝนตกปานกลาง"
							: parseFloat(data.rainfall_value) > 35.00 ? "ฝนตกหนัก"
							: parseFloat(data.rainfall_value) > 90.00 ? "ฝนตกหนักมาก"
							: "ไม่มีฝน",
					}
				});
			}
		}
	}

	// Return the data
    return res.json({ result: true, data: filteredData });
});

/* Listener */
app.listen(3000, function (err) {
    if (err) console.log(err);
    console.log("Server listening on http://localhost:3000");
});

/* this is a dummy implementation to create poi-data, which are passed over to JS / Wikitude SDK on first location update */
function onLocationUpdated(position) {
	
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	var altitude = position.coords.altitude;

	var options = {
		geojson: true,
		reset: true,
		latitude: latitude,
		longitude: longitude,
		altitude: altitude, 
		geolocation: true
	};

	if (app.wikitudePlugin != null && (devicePlatform == 'iOS' || devicePlatform == 'Android')) {
		Gal.loadData(function (err, against) {
			if (!err) {
				app.wikitudePlugin.callJavaScript( "World.loadPoisFromJsonData(" + JSON.stringify( against ) +");");
			} else {
				console.log('error do pois model');
			}
		});
	} else {
		Gal.poi_nearest(function (err, data) {
			console.log('Nearest: ' + JSON.stringify(nearest));
		}, options);
	};

	// inject POI data in JSON-format to JS
}

function onLocationError(error) {
	console.log("Not able to fetch location.");
};
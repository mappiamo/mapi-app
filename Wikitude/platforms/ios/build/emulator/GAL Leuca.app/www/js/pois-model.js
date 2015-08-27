
/* this is a dummy implementation to create poi-data, which are passed over to JS / Wikitude SDK on first location update */
function onLocationUpdated(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	var altitude = position.coords.altitude;
	
	var data;

	Gal.loadData(function (err, data) {
		if (!err) {
      		app.wikitudePlugin.callJavaScript( "World.loadPoisFromJsonData(" + JSON.stringify( data ) +");");
      	};
    });

	// inject POI data in JSON-format to JS
}

function onLocationError(error) {
	console.log("Not able to fetch location.");
};
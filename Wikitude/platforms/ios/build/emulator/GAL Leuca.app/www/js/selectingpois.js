// implementation of AR-Experience (aka "World")
var World = {
	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// The last selected marker
	currentMarker: null,

	// called to inject new POI data
	loadPoisFromJsonData: function (poiData) {
		// empty list of visible markers
		World.markerList = [];

		var msg = _.size(poiData) + ' punti di interesse trovati';

		// Start loading marker assets:
		// Create an AR.ImageResource for the marker idle-image
		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		// Create an AR.ImageResource for the marker selected-image
		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		// Create an AR.ImageResource referencing the image that should be displayed for a direction indicator. 
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		async.each(poiData, function (poi, callback) {
			World.markerList.push(new Marker(poi));
			callback();
		}, function (err) {
			console.log('finish.');
			// log message
			console.log(msg);
		});

		World.updateStatusMessage(msg);
	},

	// updates status message shon in small "i"-button aligned bottom center
	
	updateStatusMessage: function (message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function (lat, lon, alt, acc) {

		/*
			The custom function World.onLocationChanged checks with the flag World.initiallyLoadedData if the function was already called. With the first call of World.onLocationChanged an object that contains geo information will be created which will be later used to create a marker using the World.loadPoisFromJsonData function.
		*/

		console.log('location changed');

		if (!World.initiallyLoadedData) {
			/* 
				requestDataFromLocal with the geo information as parameters (latitude, longitude) creates different poi data to a random location in the user's vicinity.
			*/
			World.requestDataFromLocal(lat, lon, alt, acc);
			World.initiallyLoadedData = true;
		}
	},

	// fired when user pressed maker in cam
	onMarkerSelected: function (marker) {

		// deselect previous marker
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		marker.setSelected(marker);
		World.currentMarker = marker;
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function () {
		if (World.currentMarker) {
			World.currentMarker.setDeselected(World.currentMarker);
		}
	},

	// request POI data
	requestDataFromLocal: function (centerPointLatitude, centerPointLongitude, centerAltitude) {
		
		console.log('request data ...');

		/*
		var point = {
		  "type": "Feature",
		  "properties": {
		    "marker-color": "#0f0",
		    "latitude": centerPointLatitude,
		    "longitude": centerPointLongitude
		    "altitude": centerAltitude
		  },
		  "geometry": {
		    "type": "Point",
		    "coordinates": [centerPointLongitude, centerPointLatitude]
		  }
		};
		*/
		
		// var poiData = [];
		
		var options = {
			geojson: false,
			reset: false,
			nearest: false,
			latitude: centerPointLatitude,
			longitude: centerPointLongitude,
			geolocation: true
		};

		Gal.loadData(function (err, against) {
			if (!err) {
				// var nearest = turf.nearest(point, against);
				World.loadPoisFromJsonData(against);
	      	};
	    }, options);

	/*
		var poisToCreate = 20;
		var poiData = [];

		for (var i = 0; i < poisToCreate; i++) {
			poiData.push({
				"id": (i + 1),
				"longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
				"latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
				"description": ("This is the description of POI#" + (i + 1)),
				// use this value to ignore altitude information in general - marker will always be on user-level
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"name": ("POI#" + (i + 1))
			});
		};
		World.loadPoisFromJsonData(poiData);
	*/
	}
};

console.log('load World: step 1');
		/* 
Set a custom function where location changes are forwarded to. There is also a possibility to set AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further location updates will be received. 
*/
AR.context.onLocationChanged = World.locationChanged;

console.log('load World: step 2');
/*
	To detect clicks where no drawable was hit set a custom function on AR.context.onScreenClick where the currently selected marker is deselected.
*/
AR.context.onScreenClick = World.onScreenClick;


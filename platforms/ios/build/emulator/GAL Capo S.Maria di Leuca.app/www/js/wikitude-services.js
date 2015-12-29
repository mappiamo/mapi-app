/*!
 * Copyright 2015 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 *
 */

angular.module('wikitude.plugin', ['angularLoad'])

.factory('$AR', function($window, $q){

    //Google's url for async maps initialization accepting callback function
    var asyncUrl = 'architect://architect.js';
    var defer = $q.defer();

    //Callback function - resolving promise after maps successfully loaded
    $window.ARExperience = defer.resolve; // removed ()

    //Async loader
    var asyncLoad = function(asyncUrl) {
      var script = document.createElement('script');
      //script.type = 'text/javascript';
      script.src = asyncUrl;
      document.body.appendChild(script);
    };
    //Start loading google maps
    asyncLoad(asyncUrl);

    //Usage: Initializer.mapsInitialized.then(callback)
    return {
        ARInitialized : defer.promise
    };
})

/*
.factory("$ARContext", function ($window) {
	return $window.AR.context;
})

.factory("$AR", function ($window) {
	return new $window.AR;
})
*/

.factory("$wikitudeWorld", function (Gal, _, $window) {

	// implementation of AR-Experience (aka "World")
	var World = {
		
		// true once data was fetched
		initiallyLoadedData: false,

		// different POI-Marker assets
		markerDrawable_idle: null,

		// called to inject new POI data
		loadPoisFromJsonData: function (poiData) {

			console.log('load World ... init ');
			
			// Start loading marker assets:
			// Create an AR.ImageResource for the marker idle-image
			World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
			
			var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);
			var markerImageDrawable_idle = new AR.ImageDrawable(World.markerDrawable_idle, 2.5, {
				zOrder: 0,
				opacity: 1.0
			});

			// create GeoObject
			var markerObject = new AR.GeoObject(markerLocation, {
				drawables: {
					cam: [markerImageDrawable_idle]
				}
			});

			var msg = '1 place loaded';
			console.log(msg);
			
		},	

		// location updates, fired every time you call architectView.setLocation() in native environment
		locationChanged: function (lat, lon, alt, acc) {

			/*
				The custom function World.onLocationChanged checks with the flag World.initiallyLoadedData if the function was already called. With the first call of World.onLocationChanged an object that contains geo information will be created which will be later used to create a marker using the World.loadPoisFromJsonData function.
			*/
			if (!World.initiallyLoadedData) {
				// creates a poi object with a random location near the user's location
				var poiData = {
					"id": 1,
					"longitude": (lon + (Math.random() / 5 - 0.1)),
					"latitude": (lat + (Math.random() / 5 - 0.1)),
					"altitude": 100.0
				};

				World.loadPoisFromJsonData(poiData);
				World.initiallyLoadedData = true;
			}
		}, 

		run: function(done) {
			console.log('start world ...');
			AR.context.onLocationChanged = World.locationChanged;
			done(false);
		}

	};

	return World;

})

.factory("$wikitude", function ($ionicPlatform, Geolocation, Gal, async, $wikitudeWorld) {
		
	var wikitude_json = {

		wobj: null,
	    
	    loadArchitect: function (done) {

	    	var self = this;
	    	console.log('loading architect JS ... ' + self.architect);
	    	angularLoad.loadScript('architect://architect.js').then(function() {
			    // Script loaded succesfully.
			    // We can now start using the functions from someplugin.js
				console.log('loaded architect JS, Ok.');
				$wikitudeWorld.run(done);
			}).catch(function() {
			    // There was some error loading the script. Meh
				console.log('error to load architect JS');
			});

	    },

	    run: function(done) {
	    	
	    	console.log('wikitude initializing...');
	    	
	    	// $ionicPlatform.ready(function() {

    		// console.log('platform ready...');
    		
    		wikitude_json.wobj = cordova.require('com.wikitude.phonegap.WikitudePlugin.WikitudePlugin');
    		console.log('check device supported');
    		
    		wikitude_json.wobj.isDeviceSupported(function () {

    			console.log('wikitude device supported checked Ok.');
    
	        	// wikitude_json.wobj.setOnUrlInvokeCallback(wikitude_json.onURLInvoked);

	        	// load an ARchitect World
	        	console.log('starting architect ... ');
	        	
	        	wikitude_json.wobj.loadARchitectWorld(function (loadedURL) {
	        		console.log('Wikitude Loaded Successful OK: ' + loadedURL);
	        		$wikitudeWorld.run(done);
	        	}, function (errMsg) {
	        		console.log('Error: wikitude Failed Launching.: ' + errorMgs)
	        	}, 
	        	"www/templates/poi-real-camera.html", 
	            [ "2d_tracking", "geo" ], 
	            {
	        		camera_position: "back"
	    		});
				
    		}, function (err) {
    			console.log(err);
    			console.log('device not supported')
    			done(true);
    		}, wikitude_json.requiredFeatures);

	    	// });
	    },

    	onUrlInvoke: function (url) {
			console.log('Wikitude AR => PhoneGap ' + url);
    	}
	};
	
	return wikitude_json;
		
});
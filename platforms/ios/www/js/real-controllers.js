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

var ctrls = angular.module('gal.real.controllers', ['ngCordova' ,'leaflet-directive']);

ctrls.controller('RealCameraCtrl', function ($scope, Gal, $cordovaDeviceMotion, $cordovaDeviceOrientation, $wikitude, Geolocation) {

	$scope.$on('$ionicView.beforeEnter', function() {
		console.log('calling wikitude ...');
		$wikitude.start();
	});
    
});

// Bussola
ctrls.controller('RealCtrl', function ($scope, Geolocation, $cordovaDeviceMotion, $cordovaDeviceOrientation, Gal, _, $ionicLoading, TEST, $timeout, $utility, $ionicGesture, $ionicModal) {

	var test = false;
	var magnetic = 0;
	var magneticHeading;
	var trueHeading;
	var accuracy;
	var timeStamp;
	var watch;
	
	$scope.spinner = false;
	$scope.dataOk = false;
	$scope.isPOI = false;
	
	$ionicModal.fromTemplateUrl('templates/poi-list-modal.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});
	 
	$scope.openModal = function() {
		$scope.modal.show();
	};

	$scope.viewRoute = function (id, idpoi, lat, lon) {
		$scope.closeModal();
		window.location.href = '#/tab/route/' + id + '/' + idpoi + '/' + lat + '/' + lon;
	};

	$scope.closeModal = function() {
		$scope.isPOI = false;
		$scope.modal.hide();
	};

	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
	// Execute action
	});
	
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
	// Execute action
	});

	$scope.$on('$ionicView.beforeEnter', function() {
		// test = TEST.value;
		
		$scope.error = false;
		$scope.isLocation = false;
		
		if (test) {
			var m = Math.floor((Math.random() * 360) + 1);
			_setMagnetic(90);
			// _setMagnetic(m);
		} else {
			_setMagnetic(0);
		};

      	Geolocation.get(_onSuccess, _onError);

  	});
  	
  	function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  	};

	var orientation = {
		magneticHeading: 0,
        trueHeading: false,
        accuracy: 0,
        timeStamp: null
	};

	var location = {
		latitude: 0,
		longitude: 0
	};

	var location = Geolocation.location();
	$scope.location = location;
	$scope.isLocation = true;

	function _onSuccess(result) {
		console.log('success geolocation');
		location.latitude = result.coords.latitude;
		location.longitude = result.coords.longitude;
		$scope.location = location;
		$scope.isLocation = true;
		Geolocation.save(result);
	};  

	function _onError(err) {
		console.log('error to orientation');
	};
	
	/*
	function _getOrientation() {
    	console.log('start device orientation');
    	$cordovaDeviceOrientation.getCurrentHeading().then(function(result) {
	       var magneticHeading = result.magneticHeading;
	       var trueHeading = result.trueHeading;
	       var accuracy = result.headingAccuracy;
	       var timeStamp = result.timestamp;
	       $scope.magnetic = magneticHeading;
	    }, function(err) {
	      // An error occurred
	      console.log('error to device orientation')
	    });
    };
    */

    var options = {
      frequency: 3000,
      filter: true     // if frequency is set, filter is ignored
    }

    if (!test) {
	    watch = $cordovaDeviceOrientation.watchHeading(options).then(
	      null,
	      function(error) {
	        // An error occurred
	        console.log('error to device orientation');
	      },
	      function(result) {   // updates constantly (depending on frequency value)
	       	magneticHeading = result.magneticHeading;
	        trueHeading = result.trueHeading;
	        accuracy = result.headingAccuracy;
	        timeStamp = result.timestamp;
	        _setMagnetic(result.magneticHeading);
	    });
	};

    function _setMagnetic(m) {
    	console.log('Magnetic Heading: ' + m);
    	magnetic = m;
    	$scope.magnetic = m;
    	$scope.transform = "rotate(" + m + "deg)";
    	// $scope.npois = 'Trovati n.0 punti di interesse';
    };

    // Hold Compass
    var el = angular.element('#compass');
    $ionicGesture.on('hold', function(e) {
    	$scope.spinner = true;
    	$scope.isPOI = false;
       _getPois(magnetic);
    }, el);

    function _getPois(magnetic) {

    	var direction = $utility._getDirection(magnetic);
    	console.log('search pois in ' + direction);
		
		Gal.poi_nearest(direction, function (err, data, direction) {
			
			// console.log('Direction to filter: ' + direction);
			
			$scope.spinner = false;

			if (_.size(data) > 0) {

				// console.log(JSON.stringify(data));

				var d = _.sortBy(data, function (item) {
					return Geolocation.distance(item.item.lat, item.item.lon);
				});

				// console.log('Direction: ' + direction + ' - ' + JSON.stringify(d));

				var s = _.filter(d, function (item) {
					return item.direction == direction;
				});

				$scope.npois = 'Trovati n.' + _.size(s) + ' punti di interesse, in questa direzione.';

				console.log(JSON.stringify(s));

				$scope.error = false;
				
				if (_.size(s) > 0) {
					$scope.pois = s;
					$scope.isPOI = true;
					$scope.openModal();
				} else {
					// non sono stati trovati punti di interesse
					$scope.isPOI = false;
				};

				// $scope.openModal();
			} else {
				$scope.isPOI = false;
			};
		});
	};

	$scope.$on('$ionicView.leave', function() {
		$cordovaDeviceOrientation.clearWatch(watch)
	      .then(function(result) {
	        // Success!
	        console.log('stop watching Device Orientation');
	      }, function(err) {
	        // An error occurred
	        console.log('errot to stop watching Device Orientation');
	      });
	});

	$timeout(function() {
     	if (test) {
     		var m = Math.floor((Math.random() * 360) + 1);
     		m = 90;
     		_setMagnetic(m);
     	}
  	}, 1000);
});

ctrls.controller('RealMapCtrl', function ($scope, $stateParams, async, leafletData, Geolocation, Gal, _, $ionicLoading, Mapquest, MapBox) {

	var id = $stateParams.id;
	var idpoi = $stateParams.idpoi;

	$scope.id = id;
	$scope.idpoi = idpoi;
	$scope.isLocation = false;

	var lat = $stateParams.lat;
	var lng = $stateParams.lng;
	var dir;
	var layer_control;
	var layer_geojson;
	var layers_geojson = [];
	var geojson;

	console.log('route to ' + lat + ',' + lng);

	var location = {
		latitude: 0,
		longitude: 0
	};

	angular.extend($scope, {
        defaults: {
            scrollWheelZoom: false
        }
    });

    _initMap();
	
	$scope.$on('$ionicView.beforeEnter', function() {
		showSpinner(true);	
		location = Geolocation.location();
	});

	$scope.$on('$ionicView.enter', function(e) {
		// _refresh();
	});
  
  	function showSpinner (view, message) {

	  var msg = '<ion-spinner icon="lines"></ion-spinner>';

	  if (typeof message !== 'undefined') {
	    msg = message;
	  };

	  if (view) {  
	    $ionicLoading.show({
	        template: msg
	    });
	  } else {
	    $ionicLoading.hide();
	  }
	};

	function _initMap () {

	    leafletData.getMap('map_route').then(function(map) {

    		$scope.location = location;
    		$scope.isLocation = true;

	    	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	    	var osmAttribution = 'Map data © OpenStreetMap contributors, CC-BY-SA';
	    
		    var osm = new L.TileLayer(osmUrl, {
		        maxZoom: 18, 
		        attribution: osmAttribution
		    }).addTo(map);

		    if (layer_control) {
		    	layer_control.removeFrom(map);
		    };

		    var options_weather_layer = {
				showLegend: false, 
				opacity: 0.2 
			};

	      	var clouds = L.OWM.clouds(options_weather_layer);
	      	var city = L.OWM.current({intervall: 15, lang: 'it'});
	      	var precipitation = L.OWM.precipitation(options_weather_layer);
	      	var rain = L.OWM.rain(options_weather_layer);
	      	var snow = L.OWM.snow(options_weather_layer);
	      	var temp = L.OWM.temperature(options_weather_layer);
	      	var wind = L.OWM.wind(options_weather_layer);

			var baseMaps = { "OSM Standard": osm };
			var overlayMaps = { 
				"Clouds": clouds, 
				"Precipitazioni": precipitation,
				"Neve": snow,
				"Temperature": temp,
				"vento": wind,
				"Cities": city 
			};
	      	
	      	layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);

	    	map.invalidateSize();
	      	showSpinner(false);
	      	_routing();

		});
	};

	function _routing () {

		showSpinner(true);

		var end = {
			latitude: lat,
			longitude: lng
		};

		MapBox.direction (location, end, 0, function (err, data_geojson) {
			
			_geojson(data_geojson);

			showSpinner(false);
		});

	};

	function _geojson(geojson) {

		var bounds = [];

      leafletData.getMap('map_route').then(function(map) {

      	L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

      	// cancello tutti i layers
      	async.each(layers_geojson, function (item, callback) {
			if (item) {
      			map.removeLayer(layer_geojson);
      			callback();
    		};	
		}, function (err) {
			// 
		});

		var route = { 
			type: 'FeatureCollection',
			features: [{ 
		      	type: 'Feature',
		        geometry: geojson.routes[0].geometry,
		        properties: {
		        	distance: geojson.routes[0].distance,
		        	duration: geojson.routes[0].duration,
		        	summary: geojson.routes[0].summary
		        }
		    }]
		};

		var layer_geojson = L.geoJson(route).addTo(map);
		layers_geojson.push(layer_geojson);

		// console.log(JSON.stringify(geojson.routes[0].steps));

		var steps = { 
			type: 'FeatureCollection',
			features: []
		};

      	// steps

      	var i = 0;
      	
		async.each(geojson.routes[0].steps, function (item, callback) {

			var m = item.maneuver;

			// console.log(JSON.stringify(m));

			var f = { 
		      	type: 'Feature',
		        geometry: m.location,
		        properties: {
		        	type: m.type,
		        	instruction: m.instruction,
		        	distance: item.distance,
		        	duration: item.duration,
		        	way_name: item.wayname,
		        	direction: item.direction,
		        	heading: item.heading,
		        	icon: {},
		        	img: ''   // inserire una immagine per la direzione
		        }
		    };

		    if (i == 0) {
		    	f.properties.icon = { 
		    		icon: 'map-pin', 
		    		prefix: 'fa', 
		    		markerColor: 'red', 
		    		iconColor: '#ffffff'
		    	};
		    } else if (i == _.size(geojson.routes[0].steps)-1) {
		    	f.properties.icon = { 
		    		icon: 'flag-checkered', 
		    		prefix: 'fa', 
		    		markerColor: 'green', 
		    		iconColor: '#ffffff'
		    	};
		    } else {
		    	// icona per la direzione 
		    	f.properties.icon = { 
		    		icon: 'info-circle', 
		    		prefix: 'fa', 
		    		markerColor: 'blue', 
		    		iconColor: '#ffffff'
		    	};
		    }

		    i++;

		    // console.log(JSON.stringify(f));

		    steps.features.push(f);

		    callback();

		}, function (err) {
			console.log('done');
			
			layer_geojson = L.geoJson(steps, {

				pointToLayer: function ( feature, latlng ) {

					// console.log(JSON.stringify(feature));

					var icon = L.AwesomeMarkers.icon(feature.properties.icon);

					var d = '<div><h2>' + feature.properties.type + '</h2>';

					if (typeof feature.properties.direction !== 'undefined') {
						d += '<h3>' + feature.properties.direction + '</h3>';
					};

					if (typeof feature.properties.instruction !== 'undefined') {
						d += '<p>' + feature.properties.instruction + '</p>';
					};

					d += '</div>';

					return L.marker(latlng, {
						icon: icon
					}).bindPopup(d);

				},

				onEachFeature: function ( feature, layer ) {

					// 
				}
	        });
	                                       
	        layer_geojson.addTo(map);
	        layers_geojson.push(layer_geojson);

	        map.fitBounds(layer_geojson.getBounds());

		});

		map.invalidateSize();

    });

  };

});
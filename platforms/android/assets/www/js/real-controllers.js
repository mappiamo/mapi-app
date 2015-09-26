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

ctrls.controller('RealCameraCtrl', function ($scope, $cordovaDevice, $startApp, $cordovaAppAvailability) {

	try {
	    var deviceInfo = {
	    	device: $cordovaDevice.getDevice(),
	    	cordova: $cordovaDevice.getCordova(),
	    	model: $cordovaDevice.getModel(),
	    	platform: $cordovaDevice.getPlatform(),
	    	UUID: $cordovaDevice.getUUID(),
	    	version: $cordovaDevice.getVersion()
	    };

	    console.log(JSON.stringify($scope.deviceInfo));

		if (deviceInfo.platform == 'Android') {
			var nameApp = "com.mappiamo.galleuca";
			console.log('run App: ' + nameApp);
			_runApp(nameApp);
		} else if (deviceInfo.platform == 'iOS') {
			var nameApp = "galreality://";
			console.log('run App: ' + nameApp);
			_runApp(nameApp);
		} else {
			$scope.message = 'Questa funzione è disponibile solo per sistemi Android e IOS';
		};

		$scope.devicePlatform = deviceInfo.platform;
		$scope.deviceVersion = deviceInfo.version;
		$scope.deviceModel = deviceInfo.model;

		function _runApp (nameApp) {
			$scope.message = 'Avvio Realtà Aumentata...';
			
			$cordovaAppAvailability.check(nameApp)
				.then(function() {
					// is available
					$scope.message = 'App trovata';
					$startApp.run(nameApp, function (err, message) {
						$scope.message = message;
					});
				}, function () {
					// not available
					$scope.message = 'Non ho trovato l\'App Gal Leuca Reality';
			});
		  	

		};
	}
	catch(err) {
	    console.log('device don\'t start');
	};
    
});

// Bussola
ctrls.controller('RealCtrl', function ($scope, Geolocation, $cordovaDeviceMotion, $cordovaDeviceOrientation, Gal, _, $ionicLoading, TEST, $timeout, $utility, $ionicGesture, $ionicModal, GeoJSON, leafletData, $ui) {

	/*
	var test = {
		state: TEST.value,
		value: function (random) {
			if (random) {
				return Math.floor((Math.random() * 360) + 1);
			} else {
				return 1; // Direzione Nord
			}
		}
	};
	*/

	/*
	var magnetic = 0;
	var magneticHeading;
	var trueHeading;
	var accuracy;
	var timeStamp;
	var watch;
	*/

	var layer_control;
	var layer_nearest;
	var geojson;

	/*
	var orientation = {
		magneticHeading: 0,
        trueHeading: false,
        accuracy: 0,
        timeStamp: null
	};
	*/

	var location = {
		latitude: 0,
		longitude: 0
	};

	$scope.$on('$ionicView.beforeLeave', function() {
		console.log('view before leave');
		// $scope.closeMap();
		// _stopWatch();
	});

	$scope.$on('$ionicView.leave', function() {
		console.log('view leave');
	});

	/*
	$ionicModal.fromTemplateUrl('templates/real-map.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	});
	 
	$scope.openMap = function() {
		$scope.modal.show();
	};
	*/

	/*
	$scope.viewInfo = function (id, idpoi, lat, lon) {
		console.log('view info');
		_stopWatch();
		window.location.href = '#/tab/poi/' + id + '/' + idpoi + '/' + lat + '/' + lon;
	};
	*/

	/*
	$scope.closeMap = function() {
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
	*/

	$scope.$on('$ionicView.beforeEnter', function() {
		// test = TEST.value;
		
		/*
		$scope.isSearch = false;
		$scope.isError = false;
		
		if (test.state) {
			var m = test.value(true);
			_setMagnetic(m);
		} else {
			_setMagnetic(0);
		};
		*/

		_geojson();

		// Geolocation.get(_onSuccess, _onError);

		/*
		if (!test.state) {
			_startWatch();    
		};
		*/

  	});

  	Geolocation.watch(_onSuccess, _onError);

  	function _initMap () {

	    console.log('init map');

	    leafletData.getMap('map_compass').then(function(map) {

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
	        // "Clouds": clouds, 
	        // "Precipitazioni": precipitation,
	        // "Neve": snow,
	        // "Temperature": temp,
	        // "vento": wind,
	        "Meteo": city 
	      };

	      layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);
	      
	      map.invalidateSize();

	    });

  	};
  	
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

  	angular.extend($scope, {
        defaults: {
            scrollWheelZoom: false
        }
    });

	function _onSuccess(result) {
		
		console.log('success geolocation');
		
		location.latitude = result.coords.latitude;
		location.longitude = result.coords.longitude;
		
		// $scope.location = location;
		// $scope.isLocation = true;
		
		Geolocation.save(result);

		angular.extend($scope, {
	      center: {
	        lat: result.coords.latitude,
	        lng: result.coords.longitude,
	        zoom: 8
	      }
	    });

	    leafletData.getMap('map_compass').then(function(map) {

	      var ll = L.latLng(result.coords.latitude, result.coords.longitude);

	        marker = L.userMarker(ll, {
	          pulsing: true, 
	          accuracy: 100, 
	          smallIcon: true,
	          opacity: 0.2
	        });

	        marker.bindPopup('La tua posizione');

	        marker.addTo(map);

	        map.setView([result.coords.latitude, result.coords.longitude], 9);

	        map.invalidateSize();
	    });

	    _geojson_nearest();
	};  

	function _onError(err) {
		console.log('error to orientation');
	};

	/*
	
	function _startWatch() {
		// Compass 
		var options = {
	      frequency: 3000,
	      filter: true     // if frequency is set, filter is ignored
	    };

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

    	if (test.state) {
    		$scope.location = Geolocation.location();
    		$scope.isLocation = true;
    	}

    };

    $scope.search = function () {
    	_search();	
    };

    function _search() {
    	$scope.magnetic_search = magnetic;
    	$scope.isSearch = true;
		$scope.isError = false;
       _getPois(magnetic);
    };

    // Hold Compass
    var el = angular.element('#compass');
    $ionicGesture.on('hold', function(e) {
    	_search();
    }, el);
	
	*/

	/*

    function _getPois(magnetic) {

    	var direction = $utility._getDirection(magnetic);
    	
    	console.log('search pois in ' + direction);
		
		Gal.poi_nearest(direction, function (err, data, direction) {
			
			console.log('Direction to filter: ' + direction + ' POIs ' + _.size(data));
			
			$scope.isSearch = false;
		
			if (_.size(data) > 0) {

				//console.log(JSON.stringify(data[0].item));

				var d = _.sortBy(data, function (item) {
					return Geolocation.distance(item.item.lat, item.item.lon);
				});

				//console.log('Direction: ' + direction + ' - ' + JSON.stringify(d[0].item));

				var s = _.filter(d, function (item) {
					return item.direction == direction;
				});

				$scope.npois = 'Trovati n.' + _.size(s) + ' punti di interesse, in direzione ' + $utility._getWindRose(magnetic, true);

				// console.log('Item: --------> ' + JSON.stringify(s[0]));

				$scope.isError = false;
				
				if (_.size(s) > 0) {
					$scope.content = s[0].content._content;
					$scope.category = s[0].content._categories;

					console.log('Content: ' + s[0].content._content);

					$scope.openMap();

					_geojson(s);

					_stopWatch();

				} else {
					// non sono stati trovati punti di interesse
					$scope.error_msg = 'Non ho trovato nessun Punto di interesse in direzione ' + $utility._getWindRose(magnetic, true);
					$scope.isError = true;
				};

			} else {
				$scope.isPOI = false;
			};
		});
	};

	*/

	function _geojson() {

		$ui.get('compass', function (err, lang) {
      		$scope.ui = lang;
    	});

		_initMap();

		GeoJSON.poi_all(function (err, geojson_data) {

			geojson = geojson_data;

			// console.log('GeoJSON : ' + JSON.stringify(geojson));

			angular.extend($scope, {
	            geojson: {
	                data: geojson,
	                style: 
	                function (feature) {
	                    return {
	                      color: feature.properties.color
	                    };
	                },
	                pointToLayer: function(feature, latlng) {
	                  var icon_url = 'img/markers/' + feature.properties.marker;
	                  // console.log('Icon: ' + icon_url);

	                  var markerIcon = L.icon({
	                    iconUrl: icon_url,
	                    // shadowUrl: 'leaf-shadow.png',

	                    iconSize:     [32, 37], // size of the icon
	                    // shadowSize:   [50, 64], // size of the shadow
	                    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	                    // shadowAnchor: [4, 62],  // the same for the shadow
	                    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	                  });

	                  // console.log(JSON.stringify(feature.properties));

	                  var descr = '<h4><a href="#/tab/poi/' + feature.properties.content + '/' + feature.properties.category + '/' + feature.properties.id + '/' + feature.properties.lat + '/' + feature.properties.lon + '">' + feature.properties.title + '</a></h4>' +
                                  '<p>' + feature.properties.address + '</p>';
                                  
	                    return L.marker(latlng, {
	                      icon: markerIcon
	                    }).bindPopup(descr);
	                    
	                },
	                onEachFeature: function (feature, layer) {
	                    // 
	                } 
	            }
        	});
		});

	};

	function _geojson_nearest() {

		_initMap();

		GeoJSON.poi_nearest(function (err, nearest, distance) {

			console.log('GeoJSON nearest: ' + JSON.stringify(nearest));

			leafletData.getMap('map_compass').then(function(map) {

				if (layer_nearest) {
					map.removeLayer(layer_nearest);
				};
				
				var layer_nearest = L.geoJson(nearest, {
				    style: function (feature) {
				        return {
				        	color: feature.properties.color
				        };
				    },
				    onEachFeature: function (feature, layer) {
				    	var descr = '<h4><a href="#/tab/poi/' + feature.properties.content + '/' + feature.properties.category + '/' + feature.properties.id + '/' + feature.properties.lat + '/' + feature.properties.lon + '">' + feature.properties.title + '</a></h4>' +
                                  '<p>' + feature.properties.address + '<br /> - ' + Math.round(distance) + ' Km';
                      	console.log('Distance: ' + Math.round(distance));
	                	layer.bindPopup(descr);
	                	// _setBounds(layer);
				    }
				});

				layer_nearest.addTo(map);

			});

		}, location.latitude, location.longitude, geojson);

	};

	function _setBounds(layer) {
    	leafletData.getMap('map_compass').then(function(map) {
      		map.fitBounds(layer.getBounds());
    	});
  	};

	/*
	$scope.goPOI = function () {
		$scope.closeModal();
	};
	*/

	/*
	function _setView(latlng) {
		leafletData.getMap('map_compass').then(function(map) {
	      map.setView(latlng, 9);
	    });
  	};	
  	*/

  	/*
	function _stopWatch() {

		if (!test.state) {
			// watch.clearWatch();
			$cordovaDeviceOrientation.clearWatch(watch)
		      .then(function(result) {
		        // Success!
		        console.log('stop watching Device Orientation');
		      }, function(err) {
		        // An error occurred
		        console.log('error to stop watching Device Orientation');
		      });
		};

	};

	$timeout(function() {
     	
     	if (test.state) {
     		var m = test.value(false);
			_setMagnetic(m);
     	};

     	$scope.closeMap();

  	}, 6000);
	*/
});

ctrls.controller('RealMapCtrl', function ($scope, $stateParams, async, leafletData, Geolocation, Gal, _, $ionicLoading, Mapquest, MapBox) {

	$scope.isLocation = false;

	$scope.route_data = {
		title: '',
		content: $stateParams.content,
		category: $stateParams.category,
		idpoi: $stateParams.idpoi,
		lat: $stateParams.lat,
		lng: $stateParams.lng
	};

	console.log('Parametri: ' + JSON.stringify($scope.route_data));
	
	var dir;
	var layer_control;
	var layer_geojson;
	var layers_geojson = [];
	var geojson;

	// console.log('route to ' + lat + ',' + lng);

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
			latitude: $scope.route_data.lat,
			longitude: $scope.route_data.lng
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
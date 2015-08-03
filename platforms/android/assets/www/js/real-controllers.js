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

var ctrls = angular.module('gal.real.controllers', ['cordovaDeviceMotion', 'cordovaCapture', 'leaflet-directive']);

// Realtà aumentata
ctrls.controller('RealCtrl', function ($scope, $cordovaDeviceMotion, $cordovaCapture, Geolocation, $cordovaDeviceOrientation, $cordovaCamera, Gal, _, $ionicLoading, TEST) {

	$scope.$on('$ionicView.beforeEnter', function() {
      // 
  	});

  	$scope.isLocation = false;
  	$scope.isImage = false;

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

	$scope.isPhoto = false;
	var test = TEST.value;
	$scope.error = false;

	// Create a variable to store the transform value
	$scope.transform = "rotate(0deg)";
	
	// When the number changes, update the transform string
	$scope.$watch("magnetic", function(val) {
	    $scope.transform = "rotate("+val+"deg)";
	});  

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
	
	$scope.magnetic = 0;
                 
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

    $scope.getPhoto = function() {

    	if (test) {
    		$scope.magnetic = 10;
    		Geolocation.get(_onSuccess, _onError);
    		_getPois($scope.magnetic);
			$scope.isPhoto = true;
			$scope.isImage = true;
    	} else {

		    console.log('Getting camera');

		    var options = {
		      quality: 50,
		      destinationType: Camera.DestinationType.DATA_URL,
		      sourceType: Camera.PictureSourceType.CAMERA,
		      allowEdit: false,
		      encodingType: Camera.EncodingType.JPEG,
		      targetWidth: 100,
		      targetHeight: 100,
		      popoverOptions: CameraPopoverOptions,
		      saveToPhotoAlbum: false
		    };

		    $cordovaCamera.getPicture(options).then(function(imageData) {
		      $scope.cameraimage = "data:image/jpeg;base64," + imageData;
		      $scope.isImage = true;
		      Geolocation.get(_onSuccess, _onError);
			  _getOrientation();
			  _getPois($scope.magnetic);
			  
		    }, function(err) {
		      // error
		      console.log('error to get photo');
		    });
		};

	  };

	function _getPois(degrees) {
		
		showSpinner(true);

		Gal.poi_nearest(degrees, function (err, data, direction) {
			console.log('Direction to filter: ' + direction);
			
			var d = _.sortBy(data, function (item) {
				return Geolocation.distance(item.item.lat, item.item.lon);
			});

			var s = _.filter(d, function (item) {
				return item.direction == direction;
			});

			if (_.size(s) == 0) {
				$scope.error = true;
				$scope.error_msg = 'Non ci sono punti di interesse in questa direzione';
			} else {
				$scope.error = false;
				$scope.pois = s;
			};

			$scope.isPhoto = true;
			showSpinner(false);

		});
	};
});

ctrls.controller('RealMapCtrl', function ($scope, $stateParams, leafletData, Geolocation, Gal, _, $ionicLoading, Mapquest) {

	var id = $stateParams.id;
	var idpoi = $stateParams.idpoi;

	$scope.id = id;
	$scope.idpoi = idpoi;

	var lat = $stateParams.lat;
	var lng = $stateParams.lng;
	var dir;
	var layer_control;

	$scope.dataOk = false;

	console.log('route to ' + lat + ',' + lng);

	var location = {
		latitude: 0,
		longitude: 0
	};
  	
  	$scope.$on('$ionicView.beforeEnter', function() {
		showSpinner(true);
	  	Geolocation.get(_onSuccess, _onError);
	});

	$scope.$on('$ionicView.enter', function(e) {
		// _refresh();
	});

	angular.extend($scope, {
        defaults: {
            scrollWheelZoom: false
        }
    });

	function _onSuccess(position) {

		location.latitude = position.coords.latitude;
		location.longitude = position.coords.longitude;

		$scope.location = location;

		console.log('start from ' + location.latitude + ',' + location.longitude);

	    // init map  

	    $scope.isLocation = true;

	    Geolocation.save(position);
	    
	    _initMap();
	    _refresh();
	 };

	function _onError(error) {
		console.log('error to get location ...')
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

	function _initMap () {

	    leafletData.getMap('map_route').then(function(map) {

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

		    });
	};

	function _refresh() {

		console.log('start routing map ...');

		leafletData.getMap('map_route').then(function(map) {

			L.Routing.control({
			    waypoints: [
			        L.latLng(location.latitude, location.longitude),
			        L.latLng(lat, lng)
			    ],
			    routeWhileDragging: true,
			    reverseWaypoints: true
			}).addTo(map);

			$scope.dataOk = true;
			showSpinner(false);
		});
	}

});
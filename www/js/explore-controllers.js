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

var ctrls = angular.module('gal.explore.controllers', ['leaflet-directive']);

// *****************************
// **
// **
// ** lista degli itinerari

ctrls.controller('ExploreCtrl', function ($scope, Gal, $ionicLoading, $utility, $ionicPopup, DataSync, $cordovaFileTransfer, $cordovaProgress, async, $cordovaFile, _, $ionicLoading) {

  $scope.dataOk = false;
  var reset = true;
  // var test = true;

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Download dei dati',
      template: 'Il download dei dati può durare molto tempo. Sei sicuro?'
    });
    
    confirmPopup.then(function(res) {
      if (res) {

        console.log('Si. Sono sicuro');

        showSpinner(true);

        // comincia il download dei dati
        DataSync.download(function (err, data, pois) {
          console.log('saved ...');
          // save attachments
          // _downloadMedia(data, pois);
          showSpinner(false);
        }, reset);
      } else {
        console.log('No. Aspetto un secondo momento.');
      }
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

  $scope.download = function () {
    $scope.showConfirm();
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
  
  $scope.$on('$ionicView.enter', function(e) {
    _refresh();  
  });

  function _refresh() {
    $scope.routes = Gal.routes;
    $scope.dataOk = true;
    showSpinner(false); 
  };

  $scope.goHome = function () {
    window.location.href = '#/tab/home';
  };
  
});

// *****************************
// **
// **
// ** dettagli dell'itinerario

ctrls.controller('ExploreDetailCtrl', function ($scope, $stateParams, Gal, GeoJSON, S, Geolocation, $ionicLoading, leafletData, $geo, DataSync, $image, $ionicActionSheet, $timeout, $cordovaSocialSharing, MAPPIAMO) {

  var content = $stateParams.content;
  $scope.content = content;
  
  $scope.category = $stateParams.category;

  var it = Gal.getRoute(content);

  var geojson;
  var layer_geojson;
  var color;

  $scope.isMedia = false;
  $scope.dataOk = false;
  $scope.title = it.title;

  console.log('Explore details: ' + content);

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      Geolocation.get(_onSuccess, _onError);
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  // ------------------------------------
  // Social sharing

  $scope.share = function(title, start, end) {

    var msg = title + ', ' + start + '-' + end + ' ' + MAPPIAMO.hashtag;

    console.log('Sharing: ' + msg);

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Facebook' },
        { text: 'Twitter' },
        { text: 'WhatsApp' } 
      ],
      destructiveText: '',
      titleText: 'Share',
      cancelText: 'Cancel',
      cancel: function() {
          // add cancel code..
      },
      buttonClicked: function(index) {
        if (index==0) {
          share_Facebook(msg);
        } else if (index==1) {
          share_Twitter(msg);
        } else if (index==2) {
          share_whatsApp(msg);
        }
      }
    });

    // For example's sake, hide the sheet after two seconds
    $timeout(function() {
     hideSheet();
    }, 2000);

  };

  function share_Twitter(message) {

    $cordovaSocialSharing
      .shareViaTwitter(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing twitter.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing twitter Error.');
      });
  }

  function share_Facebook(message) {
    
    $cordovaSocialSharing
      .shareViaWhatsApp(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing facebook.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing facebook. Error');
      });
  };

  function share_whatsApp(message) {
    
    $cordovaSocialSharing
      .shareViaFacebook(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing whatsApp.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing whatsApp. Error');
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

  function _onSuccess(position) {

    Geolocation.save(position);

    // init map  
    angular.extend($scope, {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 8
      },
        defaults: {
            scrollWheelZoom: false
        }
    });

  };

  function _onError(error) {
    console.log('error to get location ...')
  };

  function _geojson() {

      leafletData.getMap('map_explore').then(function(map) {

        if (layer_geojson) {
          map.removeLayer(layer_geojson);
        };

        layer_geojson = L.geoJson(geojson, {
          onEachFeature: function (feature, layer) {
            map.fitBounds(layer.getBounds());
          }
        });

        layer_geojson.addTo(map);

        map.invalidateSize();
    });

  };

  function _refresh() {

    console.log('Detail by content ' + content);

    Gal.content(content, function (err, data) {

      if (!err) {

        var dt = data.data;

        // console.log(JSON.stringify(dt));

        dt.text = S(S(dt.text).stripTags().s).decodeHTMLEntities().s;
        
        if (typeof dt.meta[3] !== undefined) {
          dt.meta[3].value = S(S(dt.meta[3].value).stripTags().s).decodeHTMLEntities().s;
        };

        if (typeof dt.meta[7] !== undefined) {
          dt.meta[7].value = S(S(dt.meta[7].value).stripTags().s).decodeHTMLEntities().s;
        };
      
        $scope.explore = dt;
        $scope.dataOk = true;

        // percorso dell'itinerario
        var geometry = $geo.parse(dt.route);

        geojson = {
          "type": "Feature",
          "geometry": geometry,
          "properties": {}
        };

        _geojson();

        // ----------------------------
        console.log('adding media...');
        $image.getData(dt.media, function (err, medias) {
          $scope.isMedia = true;
          $scope.medias = medias;  
        });

        showSpinner(false);
      
      };
    });
  };

});

// *****************************
// **
// **
// ** lista dei punti di interesse

ctrls.controller('PoiListCtrl', function ($scope, $stateParams, Gal, _, Geolocation, $ionicLoading, $cordovaSocialSharing, $ionicActionSheet, $timeout, MAPPIAMO) {
  
  $scope.content = $stateParams.content;
  $scope.category = $stateParams.category;

  var it = Gal.getRoute($scope.content);

  $scope.title = it.title;
  $scope.dataOk = false;
  
  console.log('Param content: ' + $scope.content);
  console.log('Param category: ' + $scope.category);

  $scope.$on('$ionicView.enter', function(e) {
    Geolocation.get(_onSuccess, _onError);
    _refresh();
  });

  function _onSuccess(position) {
    Geolocation.save(position);
  };

  function _onError(error) {
    console.log('error to get location ...')
  };

  $scope.viewRoute = function (id, idpoi, lat, lon) {
    window.location.href = '#/tab/route/' + id + '/' + idpoi + '/' + lat + '/' + lon;
  };

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
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

  $scope.goBack = function (id) {
    window.location.href = '#/tab/explore/' + id;
  };

  $scope.goMap = function (id) {
    console.log('go to map: ' + route_name);
    window.location.href = '#/tab/map/' + id;
  };

  function _refresh() {

    Gal.poi($scope.category, null, function (err, data) {
      // creo un file geojson con i dati 
      // la lista dei luoghi di interesse ordinati per coordinate
      // mappa da poter visualizzare
      // filtro dei punti di interesse
      if (!err) {
        
        // console.log(JSON.stringify(data.data));

        var d_sorted = _.sortBy(data.data, function (item) {
          return Geolocation.distance(item.lat, item.lon);
        });

        if (_.size(d_sorted) == 0) {
          $scope.pois = data.data;
        } else {
          $scope.pois = d_sorted;
        };

        $scope.dataOk = true;
        showSpinner(false);
      }
    });
  };
  
  // ------------------------------------
  // Social sharing

  $scope.share = function(poi) {

    var location = 'http://www.openstreetmap.org/?mlat=' + poi.lat + '&mlon=' + poi.lon + '&zoom=12#map=12/40.1000/17.2000'

    var msg = poi.title + ', ' + poi.address + '-' + location + ' ' + MAPPIAMO.hashtag;

    console.log('Sharing: ' + msg);

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Facebook' },
        { text: 'Twitter' },
        { text: 'WhatsApp' } 
      ],
      destructiveText: '',
      titleText: 'Share',
      cancelText: 'Cancel',
      cancel: function() {
          // add cancel code..
      },
      buttonClicked: function(index) {
        if (index==0) {
          share_Facebook(msg);
        } else if (index==1) {
          share_Twitter(msg);
        } else if (index==2) {
          share_whatsApp(msg);
        }
      }
    });

    // For example's sake, hide the sheet after two seconds
    $timeout(function() {
     hideSheet();
    }, 2000);

  };

  function share_Twitter(message) {

    $cordovaSocialSharing
      .shareViaTwitter(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing twitter.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing twitter Error.');
      });
  }

  function share_Facebook(message) {
    
    $cordovaSocialSharing
      .shareViaWhatsApp(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing facebook.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing facebook. Error');
      });
  };

  function share_whatsApp(message) {
    
    $cordovaSocialSharing
      .shareViaFacebook(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing whatsApp.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing whatsApp. Error');
      });
  };

});

// *****************************
// **
// **
// ** Mappa dei punti di interesse

ctrls.controller('PoiMapCtrl', function ($scope, $stateParams, Gal, leafletData, Geolocation, GeoJSON, $ionicLoading) {

  var marker;
  var layer_control;
  var geojson;
  var layer_geojson;

  var content = $stateParams.content;
  var category = $stateParams.category;
  var it = Gal.getRoute(content);

  $scope.title = it.title;
  $scope.content = content;
  $scope.category = category;
  $scope.dataOk = false;
  
  console.log('Param Map: ' + content);

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

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      Geolocation.get(_onSuccess, _onError);
      _initMap();
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  $scope.goBack = function () {
    window.location.href = '#/tab/explore';
  };

  $scope.goList = function (route_name) {
    window.location.href = '#/tab/explore/{{route_name}}'
  };

  // Geolocation.get(_onSuccess, _onError);

  function _onSuccess(position) {

    Geolocation.save(position);

    // init map  
    angular.extend($scope, {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 8
      },
        defaults: {
            scrollWheelZoom: false
        }
    });

    leafletData.getMap('map').then(function(map) {

      var ll = L.latLng(position.coords.latitude, position.coords.longitude);

        marker = L.userMarker(ll, {
          pulsing: true, 
          accuracy: 100, 
          smallIcon: true,
          opacity: 0.2
        });
        marker.addTo(map);

        map.setView([location.latitude, location.longitude], 9);

        map.invalidateSize();
    });

  };

  function _onError(error) {
    console.log('error to get location ...');
  };

  function _refresh() {
    Gal.poi(category, null, function (err, data) {
      if (!err) {
        // $scope.routes = data;
        // console.log(JSON.stringify(data));
        GeoJSON.create(data, function (err, data_geojson) {
          geojson = data_geojson;
          // console.log(JSON.stringify(data_geojson));
          _geojson();
          $scope.dataOk = true;
          showSpinner(false);
        });
      }
    });
  };

  function _geojson() {

      leafletData.getMap('map').then(function(map) {

        layer_geojson = L.geoJson(geojson, {

          onEachFeature: function (feature, layer) {
            // map.fitBounds(layer.getBounds());
          },

          pointToLayer: function ( feature, latlng ) {

            var options_icon = { 
              icon: 'info-circle', 
              prefix: 'fa', 
              markerColor: 'blue', 
              iconColor: '#ffffff'
            };

            var icon = L.AwesomeMarkers.icon(options_icon);

            var descr = '<h3><a href="#/tab/poi/' + content + '/' + category + '/' + feature.properties.id + '/' + feature.properties.lat + '/' + feature.properties.lon + '">' + feature.properties.title + '</a></h3><br />' +
                        '<p>' + feature.properties.address + '</p>';

            map.setView(latlng, 8);

            return L.marker(latlng, {
              icon: icon
            }).bindPopup(descr);
          }
        });
                                       
        layer_geojson.addTo(map);

        map.invalidateSize();

    });

  };

  function _initMap () {

    leafletData.getMap('map').then(function(map) {

      var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var osmAttribution = 'Map data © OpenStreetMap contributors, CC-BY-SA';
      var osm = new L.TileLayer(osmUrl, {
        maxZoom: 18, 
        attribution: osmAttribution
      }).addTo(map);

      if (marker) {
        map.removeLayer(marker);
      };

      if (layer_control) {
        layer_control.removeFrom(map);
      };
                   
      if (layer_geojson) {
          map.removeLayer(layer_geojson);
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

});

// *****************************
// **
// **
// ** dettaglio del punto di interesse

ctrls.controller('PoiDetailCtrl', function ($scope, $stateParams, Gal, S, $ionicLoading, $geo, $image, leafletData, $ionicActionSheet, $timeout, $cordovaSocialSharing, Geolocation, MAPPIAMO) {

  $scope.content = $stateParams.content;
  $scope.category = $stateParams.category;

  var idpoi = $stateParams.idpoi;
  var lat = $stateParams.lat;
  var lng = $stateParams.lng;

  var layer_geojson;
  var geojson;

  // ------------------------------------
  // Social sharing

  $scope.share = function(poi) {

    var location = 'http://www.openstreetmap.org/?mlat=' + poi.lat + '&mlon=' + poi.lon + '&zoom=12#map=12/40.1000/17.2000'

    var msg = poi.title + ', ' + poi.address + '-' + location + ' ' + MAPPIAMO.hashtag;

    console.log('Sharing: ' + msg);

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Facebook' },
        { text: 'Twitter' },
        { text: 'WhatsApp' } 
      ],
      destructiveText: '',
      titleText: 'Share',
      cancelText: 'Cancel',
      cancel: function() {
          // add cancel code..
      },
      buttonClicked: function(index) {
        if (index==0) {
          share_Facebook(msg);
        } else if (index==1) {
          share_Twitter(msg);
        } else if (index==2) {
          share_whatsApp(msg);
        }
      }
    });

    // For example's sake, hide the sheet after two seconds
    $timeout(function() {
     hideSheet();
    }, 2000);

  };

  function share_Twitter(message) {

    $cordovaSocialSharing
      .shareViaTwitter(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing twitter.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing twitter Error.');
      });
  }

  function share_Facebook(message) {
    
    $cordovaSocialSharing
      .shareViaWhatsApp(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing facebook.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing facebook. Error');
      });
  };

  function share_whatsApp(message) {
    
    $cordovaSocialSharing
      .shareViaFacebook(message, MAPPIAMO.img, MAPPIAMO.web)
      .then(function(result) {
        // Success!
        console.log('sharing whatsApp.');
      }, function(err) {
        // An error occurred. Show a message to the user
        console.log('sharing whatsApp. Error');
      });
  };


  console.log('Parameters: ' + $scope.content + ',' + $scope.category + ',' + idpoi);
  
  // var it = Gal.getRoute(id);

  // $scope.title = it.name;
  $scope.dataOk = false;

  $scope.goBack = function (id) {
    window.location.href = '#/tab/explore/' + id;
  };

  Geolocation.get(_onSuccess, _onError);
  
  function _onSuccess(position) {
    Geolocation.save(position);
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

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  console.log('searching details poi by ' + idpoi);

  angular.extend($scope, {
      center: {
        lat: lat,
        lng: lng,
        zoom: 14
      },
      defaults: {
        scrollWheelZoom: false
      }
    });

  function _refresh() {

    Gal.poi($scope.category, idpoi, function (err, data) {

      // creo un file geojson con i dati 
      // la lista dei luoghi di interesse ordinati per coordinate
      // mappa da poter visualizzare
      // filtro dei punti di interesse

      if (!err) {

        var dt = data;

        // console.log(JSON.stringify(dt));

        $scope.poi = dt[0];
        $scope.dataOk = true;

        console.log('init map');

        _geojson(dt[0].route);

        // ----------------------------
        console.log('adding media... ' + _.size(dt[0].media));
        $image.getData(dt[0].media, function (err, medias) {
          $scope.isMedia = true;
          $scope.medias = medias;  
        });

        showSpinner(false);
      }
    });
  };

  function _geojson(route) {

      console.log('route: ' + JSON.stringify(route));
      var geometry = $geo.parse(route);
        
      var geojson = {
        "type": "Feature",
        "geometry": geometry,
        "properties": {}
      };

      console.log('geojson: ' + JSON.stringify(geojson));

      angular.extend($scope, {
          geojson: {
              data: geojson
              
          }
      });

      leafletData.getMap('map_poi').then(function(map) {
        var latlng = L.latLng(lat, lng);
        map.setView(latlng);
        map.setZoom(10);
      });

  };

});



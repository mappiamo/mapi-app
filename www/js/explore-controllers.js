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

ctrls.controller('ExploreCtrl', function ($scope, Gal, $ionicLoading, $utility, $ionicPopup, DataSync, $cordovaFileTransfer, $cordovaProgress, async, $cordovaFile, _, $ionicLoading, $cordovaNetwork, $language, $ui) {

  $scope.dataOk = false;
  var reset = false;
  
  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  $language.get(function (err, result) {
    $scope.language = result;
    console.log(JSON.stringify(result));
  });

  $scope.setLanguage = function(l) {
    $language.save(l);
    _refresh();
  };

  // **********************************
  // Controllo la connessione

  // listen for Online event
  
  try {
      var type = $cordovaNetwork.getNetwork()
      if (!type.UNKNOWN && !type.NONE) {
        // esegue il download dei dati solo se esiste una connessione
        DataSync.download(function (err, data, pois) {
              console.log('syncronizing ok ...');
              if (window.ProgressIndicator) {
                $cordovaProgress.hide();
              };
        }, true);
      };
  }
  catch(err) {
      console.log('non posso verificare la connessione');
  };

      /*
  var isOnline = $cordovaNetwork.isOnline()
  var isOffline = $cordovaNetwork.isOffline()

  $scope.$on('$cordovaNetwork:online', function(event, networkState){
    var onlineState = networkState;
  })

  // listen for Offline event
  $scope.$on('$cordovaNetwork:offline', function(event, networkState){
    var offlineState = networkState;
  });
  */
  
  // **********************************

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

  $ui.get('home', function (err, result) {
      $scope.ui = result;
    });

  $ui.get('tab', function (err, result) {
      $scope.uiTab = result;
  });

  function _refresh() {
    // $scope.routes = Gal.routes;
    
    console.log('refresh data ...');

    $ui.get('home', function (err, result) {
      $scope.ui = result;
    });

    $ui.get('tab', function (err, result) {
      $scope.uiTab = result;
    });

    Gal.getRoutes(function (err, routes) {
      $scope.routes = routes;
    });

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

ctrls.controller('ExploreDetailCtrl', function ($scope, $stateParams, Gal, GeoJSON, S, Geolocation, $ionicLoading, leafletData, $geo, DataSync, $image, $ionicActionSheet, $timeout, $cordovaSocialSharing, MAPPIAMO, turf) {

  var content = $stateParams.content;
  $scope.content = content;
  
  $scope.category = $stateParams.category;

  Gal.getRoute(content, function (err, item_it) {
    $scope.title = item_it.title;
  });

  var color;
  var layer_control;

  $scope.isMedia = false;
  $scope.dataOk = false;

  console.log('Explore details: ' + content);

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      Geolocation.get(_onSuccess, _onError);
      _initMap();
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  function _initMap () {

    console.log('init map');

    leafletData.getMap('map_explore').then(function(map) {

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

  // ------------------------------------
  // Social sharing

  $scope.share = function(title, start, end) {

    var msg = 'Itinerario: ' + title + ' ' + MAPPIAMO.hashtag + 
              ' ' + MAPPIAMO.contentWeb + content;

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

  var fitBounds;

  function _geojson() {

    var location = Geolocation.location();

    GeoJSON.content(content, function (err, data) {

      angular.extend($scope, {
            geojson: {
                data: data,
                style: 
                function (feature) {
                    return {
                      color: feature.properties.color
                    };
                },
                pointToLayer: function(feature, latlng) {
                    // 
                    
                },
                onEachFeature: function (feature, layer) {
                    // 
                    _setBounds(layer.getBounds());
                    layer.bindPopup(feature.properties.description);
                } 
            }
      });

      // $scope.length = turf.lineDistance(data, 'kilometers');

    });

    function _setBounds(bounds) {

      leafletData.getMap('map_explore').then(function(map) {
        console.log('set zoom');
        console.log(map._layers);
        map.fitBounds(bounds);
        map.invalidateSize();
        map.setZoom(11);
      });
    };

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
        $scope.text = S(S(dt.text).decodeHTMLEntities().s).stripTags().s;
        $scope.dataOk = true;

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





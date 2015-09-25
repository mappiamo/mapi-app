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

// *****************************
// *****************************
// **
// **
// ** Punti di Interesse - Lista

var ctrls = angular.module('gal.pois.controllers', ['leaflet-directive']);

ctrls.controller('PoiListCtrl', function ($scope, $stateParams, Gal, _, Geolocation, $ionicLoading, $cordovaSocialSharing, $ionicActionSheet, $timeout, MAPPIAMO, $ui) {
  
  $scope.content = $stateParams.content;
  $scope.category = $stateParams.category;

  Gal.getRoute($scope.content, function (err, item_it) {
    $scope.title = item_it.title;
  });
  
  $scope.dataOk = false;

  $ui.get('poilist', function (err, result) {
    $scope.ui = result;
  });
  
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

    var options_poi = {
      category: $scope.category,
      idpoi: null,
      byUrl: false
    };

    Gal.poi(function (err, data) {
      // creo un file geojson con i dati 
      // la lista dei luoghi di interesse ordinati per coordinate
      // mappa da poter visualizzare
      // filtro dei punti di interesse
      if (!err) {
        
        // console.log(JSON.stringify(data.data));

        var d_place = _.filter(data.filtered, function (item) {
          return item.type != "route"
        });

        var d_sorted = _.sortBy(d_place, function (item) {
          return Geolocation.distance(item.lat, item.lon);
        });

        if (_.size(d_sorted) == 0) {
          $scope.pois = data.filtered;
        } else {
          $scope.pois = d_sorted;
        };

        $scope.dataOk = true;
        showSpinner(false);
      }
    }, options_poi);
  };
  
  // ------------------------------------
  // Social sharing

  $scope.share = function(poi) {

    var location = 'http://www.openstreetmap.org/?mlat=' + poi.lat + '&mlon=' + poi.lon + '&zoom=12#map=12/' + poi.lat + '/' + poi.lon;

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
// *****************************
// **
// **
// ** Mappa dei punti di interesse

ctrls.controller('PoiMapCtrl', function ($scope, $stateParams, Gal, leafletData, Geolocation, GeoJSON, $ionicLoading, $geo, async, $ionicModal, $filters, $ui) {

  var marker;
  var layer_control;
  var layer_geojson;
  var name_map = 'map';
  var geojson;
  var filters;

  var content = $stateParams.content;
  var category = $stateParams.category;
  
  Gal.getRoute(content, function (err, item_it) {
    console.log(JSON.stringify(item_it));
    $scope.title = item_it.title;
  });

  $ui.get('map', function (err, result) {
    $scope.ui = result;
  });

  $scope.isMap = false;
  $scope.content = content;
  $scope.category = category;
  $scope.dataOk = false;
  
  console.log('Param Map: ' + content);

  // ************************************************
  // Selezione filtri
  // ------------------------------------------------

  $ionicModal.fromTemplateUrl('templates/filters-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openFilters = function() {
    $scope.modal.show();
  };

  $scope.closeFilters = function() {
    // refresh dei dati
    $filters.save($scope.filters, function (err, response) {
      console.log(JSON.stringify(response));
      _refresh();  
    });
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

  // ************************************************

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
      _initMap();
  });

  $scope.$on('$ionicView.enter', function(e) {
    $filters.get(function (err, filters) {
      console.log('Filters: ----------------')
      console.log(JSON.stringify(filters));
      $scope.filters = filters;
      _refresh();
    });
  });

  $scope.goBack = function () {
    window.location.href = '#/tab/explore';
  };

  $scope.goList = function (route_name) {
    window.location.href = '#/tab/explore/{{route_name}}'
  };

  angular.extend($scope, {
      defaults: {
        scrollWheelZoom: true
      }
  });

  // Geolocation
  Geolocation.get(_onSuccess, _onError);

  function _onSuccess(position) {

    console.log('save position');

    Geolocation.save(position);

    // init map  
    angular.extend($scope, {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 8
      }
    });
   
    // Punto di coordinata del device
    leafletData.getMap().then(function(map) {

      var ll = L.latLng(position.coords.latitude, position.coords.longitude);

        marker = L.userMarker(ll, {
          pulsing: true, 
          accuracy: 100, 
          smallIcon: true,
          opacity: 0.2
        });

        marker.bindPopup('La tua posizione');

        marker.addTo(map);

        map.setView([location.latitude, location.longitude], 9);

        map.invalidateSize();
    });
    
  };

  function _onError(error) {
    console.log('error to get location ...');
  };

  function _refresh() {

    console.log('refresh ...');
    $scope.isMap = false;

    showSpinner(true);

    var options = {
      all: false, 
      category: category, 
      content: content, 
      poi: null, 
      // filters: $scope.filters,
      nearest: false
    };

    GeoJSON.pois(function (err, data) {

      console.log('drawing map...')
      
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
                    var markerIcon = L.icon({
                      iconUrl: 'img/markers/' + feature.properties.marker,
                      // shadowUrl: 'leaf-shadow.png',

                      iconSize:     [32, 37], // size of the icon
                      // shadowSize:   [50, 64], // size of the shadow
                      iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
                      // shadowAnchor: [4, 62],  // the same for the shadow
                      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    });

                    var descr = '<h4><a href="#/tab/poi/' + content + '/' + category + '/' + feature.properties.id + '/' + feature.properties.lat + '/' + feature.properties.lon + '">' + feature.properties.title + '</a></h4><br />' +
                                '<h5>' + feature.properties.address + '</h5>';

                    return L.marker(latlng, {
                      icon: markerIcon
                    }).bindPopup(descr);
                },
                onEachFeature: function (feature, layer) {
                  console.log('type: ' + feature.properties.type);
                    if (feature.properties.type == 'route') {
                      console.log('set bounds');
                      _setBounds(layer);
                    };
                } 
              
            }
        });

        showSpinner(false);
        $scope.isMap = true;

    }, options);

  };

  function _setBounds(layer) {
    leafletData.getMap('map').then(function(map) {
      map.fitBounds(layer.getBounds());
    });
  };

  function _initMap () {

    console.log('init map');

    leafletData.getMap(name_map).then(function(map) {

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
        // "Clouds": clouds, 
        // "Precipitazioni": precipitation,
        // "Neve": snow,
        // "Temperature": temp,
        // "vento": wind,
        "Meteo": city 
      };

      layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);
      
      map.invalidateSize();

      showSpinner(false);

    });

  };

});

// *****************************
// *****************************
// **
// **
// ** dettaglio del punto di interesse
// *****************************

ctrls.controller('PoiDetailCtrl', function ($scope, $sce, $stateParams, Gal, S, $ionicLoading, $geo, $image, leafletData, $ionicActionSheet, $timeout, $cordovaSocialSharing, Geolocation, MAPPIAMO, GeoJSON, $ionicModal, $cordovaMedia, $ui) {

  var content = $stateParams.content;
  $scope.content = $stateParams.content;
  var category = $stateParams.category;
  $scope.category = $stateParams.category;

  var layer_control;

  var idpoi = $stateParams.idpoi;
  var lat = $stateParams.lat;
  var lng = $stateParams.lng;

  var layer_geojson;
  var geojson;
  var mediaAudio;

  $scope.isGallery = false;
  $scope.is360 = false;
  $scope.isVideo = false;
  $scope.isAudio = false;

  $ui.get('poidetail', function (err, result) {
    $scope.ui = result;
  });
  
  console.log('Parameter: ' + content + ',' + category + ',' + idpoi + ',' + lat + ',' + lng);

  // ------------------------------------
  // Social sharing

  $scope.share = function(poi) {

    // var location = 'http://www.openstreetmap.org/?mlat=' + poi.lat + '&mlon=' + poi.lon + '&zoom=12#map=12/' + poi.lat + '/' + poi.lon;

    var location = MAPPIAMO.contentWeb + content;

    var msg = poi.title + ' ' + location + ' ' + MAPPIAMO.hashtag;

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

  function _initMap () {

    console.log('init map');

    leafletData.getMap('map_poi').then(function(map) {

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

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      _initMap();
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

  $scope.playAudio = function (urlAudio) {
    
    try {
      mediaAudio = $cordovaMedia.newMedia(urlAudio);

      var iOSPlayOptions = {
        numberOfLoops: 2,
        playAudioWhenScreenIsLocked : false
      }

      mediaAudio.play(options); // iOS only!
      mediaAudio.play(); // Android
    } catch (err) {
      console.log('funziona attiva solo sul didpositivo mobile')
    }
  };

  $scope.pauseAudio = function () {
    mediaAudio.pause();
  };

  $scope.stopAudio = function () {
    mediaAudio.stop();
  };

  function _refresh() {

    var options_poi = {
      category: $scope.category,
      idpoi: idpoi,
      byUrl: false
    };

    Gal.poi(function (err, data) {

      // creo un file geojson con i dati 
      // la lista dei luoghi di interesse ordinati per coordinate
      // mappa da poter visualizzare
      // filtro dei punti di interesse

      if (!err) {

        var dt = data;

        $scope.isGallery = _.size(dt[0].media > 0);
        // ----------------------------
        console.log('-------------');
        // console.log(_.size(dt[0].media) > 0);

        $scope.text = S(S(dt[0].text).decodeHTMLEntities().s).stripTags().s;
        
        $scope.poi = dt[0];
        console.log(JSON.stringify($scope.poi.media[0]));

        $scope.dataOk = true;

        _geojson();

        $scope.isGallery = false;

        var itre = _.find(dt[0].meta, function (item) {
          return item.name == 'virtual_tour';
        });

        if (typeof itre !== 'undefined') {
          console.log(JSON.stringify(itre));
          $scope.is360 = true;
          // var u_tre = MAPPIAMO.mediatre + encodeURIComponent(itre.value) + '.html';
          var u_tre = $sce.trustAsHtml('<iframe src="' + MAPPIAMO.mediatre + encodeURIComponent(itre.value) + '.html' + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen width="400" height="560"></iframe>');

          console.log('360: ' + u_tre);
          $scope.url_tre = u_tre;
        };

        var iVideo = _.find(dt[0].meta, function (item) {
          return item.name == 'filmato';
        });

        if (typeof iVideo !== 'undefined') {
          console.log(JSON.stringify(iVideo));
          $scope.isVideo = true;
          var u_video = $sce.trustAsHtml('<iframe src="' + iVideo.value + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen width="400" height="360"></iframe>');
          $scope.video_url = iVideo.value;
        };

        var iAudio = _.find(dt[0].meta, function (item) {
          return item.name == 'audio';
        });

        if (typeof iAudio !== 'undefined') {
          console.log(JSON.stringify(iAudio));
          $scope.isAudio = true;
          $scope.url_audio = JSON.stringify(iAudio);
        };

        $image.getGallery($scope.poi.media, function (err, medias) {
          console.log('loaded images n.' + _.size(medias));
          $scope.medias = medias;
          $scope.isGallery = true;
        });
        
        showSpinner(false);
      }
    }, options_poi);
  };

  function _geojson() {

    var options = {
      all: false, 
      category: category, 
      content: content, 
      poi: idpoi, 
      nearest: false
    };

    GeoJSON.pois (function (err, data) {
      console.log('send geojson to map...');
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
                var icon_url = 'img/markers/' + feature.properties.marker;
                console.log('Icon: ' + icon_url);

                var markerIcon = L.icon({
                  iconUrl: icon_url,
                  // shadowUrl: 'leaf-shadow.png',

                  iconSize:     [32, 37], // size of the icon
                  // shadowSize:   [50, 64], // size of the shadow
                  iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                  // shadowAnchor: [4, 62],  // the same for the shadow
                  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                });

                _setView(latlng);

                return L.marker(latlng, {
                  icon: markerIcon
                }); 
                  
              },
              onEachFeature: function (feature, layer) {
                  // 
              }
          }
      });

    }, options);

  };  

  function _setView(latlng) {
    leafletData.getMap('map_poi').then(function(map) {
      map.setView(latlng, 12);
    });
  }

});
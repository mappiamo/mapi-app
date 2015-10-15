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

ctrls.controller('PoiListCtrl', function ($scope, $state, $stateParams, Gal, _, Geolocation, $ionicLoading, $cordovaSocialSharing, $ionicActionSheet, $timeout, MAPPIAMO, $ui) {
  
  $scope.content = $stateParams.content;
  $scope.category = $stateParams.category;

  Gal.getRoute($scope.content, function (err, item_it) {
    $scope.title = item_it.title;
  });
  
  $scope.dataOk = false;

  $ui.get('poilist', function (err, result) {
    $scope.ui = result;
  });

  $scope.goMap = function(content, category) {
    $state.go('map', {
      "content": content,
      "category": category
    });
  };

  $scope.goPOI = function (content, category, id, lat, lon) {
    $state.go('poi', {
      "content": content,
      "category": category,
      "idpoi": id,
      "lat": lat,
      "lng": lon
    });
  };
  
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

ctrls.controller('PoiMapCtrl', function ($scope, $state, $stateParams, Gal, leafletData, Geolocation, GeoJSON, $ionicLoading, $geo, async, $ionicModal, $filters, $ui) {

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

  var poisLatLng = [];
  
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

  $scope.goHome = function () {
    $state.go('tab.explore');
  };

  $scope.exploreDetail = function (content, category) {
    $state.go('detail', {
      "content": content,
      "category": category
    });
  };

  $scope.listPOI = function (content, category) {
    $state.go('pois', {
      "content": content,
      "category": category
    });
  };

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
        zoom: 12
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

    poisLatLng = [];

    var options = {
      all: false, 
      category: category, 
      content: content, 
      poi: null, 
      // filters: $scope.filters,
      nearest: false
    };

    GeoJSON.pois(function (err, data) {

      console.log('drawing map...');
      
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

                    var descr = '<h4><a href="#/tab/poiReal/' + content + '/' + category + '/' + feature.properties.id + '/' + feature.properties.lat + '/' + feature.properties.lon + '">' + feature.properties.title + '</a></h4><br />' +
                                '<h5>' + feature.properties.address + '</h5>';

                    poisLatLng.push(latlng);

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

  $scope.goPOI = function (content, category, id, lat, lon) {
    $state.go('poi', {
      "content": content,
      "category": category,
      "idpoi": id,
      "lat": lat,
      "lng": lon
    });
  };

  function _setBounds(layer) {

    console.log('pois ' + JSON.stringify(poisLatLng));

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

ctrls.controller('PoiDetailCtrl', function ($scope, $state, $sce, $stateParams, Gal, S, $ionicLoading, $geo, $image, leafletData, $ionicActionSheet, $timeout, $cordovaSocialSharing, Geolocation, MAPPIAMO, GeoJSON, $ionicModal, $cordovaMedia, $ui, $meta, $cordovaDevice, $cordovaFileTransfer, $cordovaFile, $app) {

  var content = 0;
  if (typeof $stateParams.content !== 'undefined') {
    content = $stateParams.content;
    $scope.content = $stateParams.content;
  };

  var category = 0;
  if (typeof $stateParams.content !== 'undefined') {
    category = $stateParams.category;
    $scope.category = $stateParams.category;
  };
  
  var layer_control;

  var idpoi = $stateParams.idpoi;
  var lat = $stateParams.lat;
  var lng = $stateParams.lng;

  var layer_geojson;
  var geojson;
  var mediaAudio;

  var location = {
    latitude: 0,
    longitude: 0
  };

  $scope.isGallery = false;
  $scope.is360 = false;
  $scope.isVideo = false;
  $scope.isAudio = false;

  $ui.get('poidetail', function (err, result) {
    $scope.ui = result;
  });

  $scope.goPOI = function (content, category, id, lat, lon) {
    $state.go('poi', {
      "content": content,
      "category": category,
      "poiid": id,
      "lat": lat,
      "lng": lon
    });
  };

  $scope.goBack = function(content, category) {
    if (content == 0 && category == 0) {
      $state.go('tab.explore');
    } else {
      $state.go('map', {
        "content": content,
        "category": category
      });
    }
  };

  $scope.openMedia = function (stateUrl, content, category, id, lat, lon) {
    $state.go(stateUrl, {
      "content": content,
      "category": category,
      "poiid": id,
      "lat": lat,
      "lng": lon
    });
  }; 

  $scope.openRoute = function () {

    var end = {
      latitude: lat,
      longitude: lng
    };

    console.log('route to ' + JSON.stringify(end));

    $app.map(end.latitude, end.longitude, function (err, msg, noDevice) {
      console.log(msg);
      if (err) {
        console.log('eseguo il navigatore interno');
        $state.go('route',
          { 
            "content": content, 
            "category": category,
            "idpoi": idpoi,
            "lat": lat,
            "lng": lng
          });
      };
    });

  };
  
  console.log('Parameter: ' + content + ',' + category + ',' + idpoi + ',' + lat + ',' + lng);

  // ------------------------------------
  // Social sharing

  $scope.share = function(poi) {

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
    }, 8000);

  };

  function share_Twitter(message) {

    console.log('sharing to twitter');
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
    
    console.log('sharing to facebook');
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
    
    console.log('sharing to wahtsapp');
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

  Geolocation.get(_onSuccess, _onError);
  
  function _onSuccess(position) {
    location.latitude = position.coords.latitude;
    location.longitude = position.coords.longitude;
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

      /*
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
      */
      
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

  function _setTrack(audioFile, title) {

    $scope.track = {
        url: audioFile,
        artist: 'Gal Capo di S.Maria di Leuca',
        title: title,
        art: 'img/logo/logo-gal_small.jpg'
    };

  };

  $scope.playAudio = function (urlAudio, id, title) {

    try {

      var url = urlAudio;
      var fileMP3 = id; // + '.mp3';
      var pathMP3 = cordova.file.documentsDirectory
      var targetPath = pathMP3 + fileMP3;
      
      $cordovaFile.checkFile(pathMP3, fileMP3)
        .then(function (success) {
          // success
          // 
          console.log('audio file: ' + targetPath);
          //$scope.audio_embed = $sce.trustAsHtml('<embed src="' + targetPath + '" autostart=false loop=false </embed>');
          _playAudio(targetPath);
          //_setTrack(targetPath, title);

        }, function (error) {
          // error
          _downloadAudio(url, targetPath, function (err) {
            if (!err) {
              console.log('downloaed audio file: ' + targetPath);
              //$scope.audio_embed = $sce.trustAsHtml('<embed src="' + targetPath + '" autostart=false loop=false </embed>');
              _playAudio(targetPath);
              //_setTrack(targetPath, title);
            };
          });
        });

    } catch (err) {
      console.log('Error play media: ' + err)
    }
  };

  function _playAudio(file) {

    // var media = new Media(file, null, null, mediaStatusCallback);
    console.log('start playing ... ' + file);

    var media = $cordovaMedia.newMedia(file);

    console.log('Play.');
    
    $cordovaMedia.play(media);

  };

  var mediaStatusCallback = function(status) {
      if(status == 1) {
          $ionicLoading.show({ template: 'playing ...' });
      } else {
          $ionicLoading.hide();
      }
  };

  function _downloadAudio(url, filePath, done) {

    var trustHosts = true
    var options = {};

    console.log('Transfer file from ' + url + ' to ' + filePath);

    $ionicLoading.show({template: 'Loading...'});

    $cordovaFileTransfer.download(url, filePath, options, trustHosts)
      .then(function(result) {
        // Success!
        console.log('play audio ' + filePath);
        $ionicLoading.hide();
        done(false);
    
      }, function(err) {
        // Error
        $ionicLoading.hide();
        done(true);
      }, function (progress) {
        $timeout(function () {
          $ionicLoading.show({ template: Math.round((progress.loaded / progress.total) * 100) + ' %'});
        })
      });

  };

  $scope.pauseAudio = function () {
    mediaAudio.pause();
  };

  $scope.stopAudio = function () {
    mediaAudio.stop();
  };

  function _viewData(data) {

    // creo un file geojson con i dati 
    // la lista dei luoghi di interesse ordinati per coordinate
    // mappa da poter visualizzare
    // filtro dei punti di interesse

    console.log('******************');
    console.log('***** POI ********');
    console.log(JSON.stringify(data));

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

    $meta.get('poi', dt[0].meta, function (err, meta) {
      $scope.meta = meta;
    });

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
      var url_v = iVideo.value.replace("watch?v=", "v/");
      var u_video = $sce.trustAsHtml('<iframe src="' + url_v + '&output=embed' + '" frameborder="0" allowfullscreen width="420" height="315"></iframe>');

      console.log(u_video);
      $scope.video_url = u_video;
    };

    var iAudio = _.find(dt[0].meta, function (item) {
      return item.name == 'audio';
    });

    if (typeof iAudio !== 'undefined') {
      console.log(JSON.stringify(iAudio));
      $scope.isAudio = true;
      // <embed src="success.wav" autostart=false loop=false>
      $scope.audio_url = iAudio.value;
      // $scope.audio_embed = $sce.trustAsHtml('<embed src="' + iAudio.value + '" autostart=false loop=false </embed>');
      // $scope.playAudio(iAudio.value, dt[0].id, dt[0].title);
    };

    $image.getGallery($scope.poi.media, function (err, medias) {
      console.log('loaded images n.' + _.size(medias));
      $scope.medias = medias;
      $scope.isGallery = true;
    });
    
    showSpinner(false);

  };

  function _refresh() {

    var options_poi = {
      category: category,
      idpoi: idpoi,
      byUrl: false
    };

    if (content == 0 && category == 0) {
      
      Gal.poiAPI(function (err, data) {
        if (!err) {
          _viewData(data);
        };
      }, options_poi);

    } else {
      
      Gal.poi(function (err, data) {
        if (!err) {
          _viewData(data);
        };
      }, options_poi);

    };
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
                  iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
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
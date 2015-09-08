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

ctrls.controller('ExploreDetailCtrl', function ($scope, $stateParams, Gal, GeoJSON, S, Geolocation, $ionicLoading, leafletData, $geo, DataSync, $image, $ionicActionSheet, $timeout, $cordovaSocialSharing, MAPPIAMO, turf) {

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

    var msg = 'Itinerario: ' + title + ', ' + start + '-' + end + ' ' + MAPPIAMO.hashtag;

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
        $scope.dataOk = true;

        // percorso dell'itinerario
        // var geometry = $geo.parse(dt.route);
        /*
        geojson = {
          "type": "Feature",
          "geometry": geometry,
          "properties": {}
        };
        */

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





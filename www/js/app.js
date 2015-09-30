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

// Ionic Starter App

angular.module('gal', ['ionic', 
                       'ngCordova', 
                       //'gal.home.controllers', 
                       'gal.real.controllers', 
                       'gal.explore.controllers',
                       'gal.pois.controllers', 
                       'gal.filters.services',
                       'gal.services', 
                       'gal.filters', 
                       'gal.weather.services', 
                       'gal.geolocation', 
                       'gal.geojson', 
                       'gal.utils', 
                       'async.services', 
                       'underscore', 
                       'angular-momentjs', 
                       'turf', 
                       'leaflet-directive', 
                       'S', 
                       'gal.mapquest', 
                       'gal.mapbox',
                       'pouchdb',
                       'pouchdb.services',
                       'gal.sync',
                       'jquery.plugin.imagedata',
                       'jquery.geo',
                       'wikitude.plugin',
                       'ionic.cordova.plugin',
                       'gal.images',
                       'base64',
                       'angularLoad',
                       'gal.startApp',
                       'ion-gallery',
                       'ionic-cache-src',
                       'ionic-sidetabs',
                       'gal.globalization',
                       'gal.ui',
                       'gal.meta',
                       'ionic-audio'])

.run(function ($ionicPlatform, Geolocation, $cordovaBackgroundGeolocation, $ionicLoading, $cordovaProgress, DataSync, $cordovaNetwork) {
  
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    };

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    };

    /*
    var options = {
      desiredAccuracy: 1000,
      stopOnTerminate: true
    };

    $cordovaBackgroundGeolocation.configure(options)
      .then(
        null, // Background never resolves
        function (err) { // error callback
          console.error(err);
        },
        function (location) { // notify callback
          console.log(location);
          Geolocation.save(location);
    });
    */

    // -------------------------------
    // sincronia dei dati
    /*
    if (window.ProgressIndicator) {
      $cordovaProgress.showSimpleWithLabelDetail(true, "Sincronizzazione", "Sincronizzazione dei dati dal server. Attendere un momento.")
    };
    */
    
  });

})

.config(function($momentProvider){
  $momentProvider
    .asyncLoading(false)
    .scriptUrl('lib/moment/moment.js');
})

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.constant('TEST', {
  url: 'test/data.json',  
  value: false
})

.constant('DB', {
  name: 'galleuca'
})

.constant('MAPPIAMO', {
  jsonp: '&callback=JSON_CALLBACK',
  content: 'http://itinerari.galcapodileuca.it/index.php?module=api&task=content&object=',
  contentWeb: 'http://itinerari.galcapodileuca.it/index.php?module=content&object=',
  poi: 'http://itinerari.galcapodileuca.it/index.php?module=api&task=category&object=',
  web: 'http://itinerari.galcapodileuca.it',
  img: 'img/logo/logo-gal.jpg',
  hashtag: '#galleuca',
  mediatre: 'http://itinerari.galcapodileuca.it/media/panorama/'
})

.constant('MAPQUEST', {
  key: 'Fmjtd|luur2ha7n9,b5=o5-9wb0q0'
})

.constant('REALITY', {
  android: {
    url: 'com.mappiamo.galleuca',
    store: ''
  },
  iOS: {
    url: 'galreality://',
    store: ''
  }
})

.constant('MAPBOX', {
  access_token: 'pk.eyJ1IjoiZ3ppbGVuaSIsImEiOiJlVmxEaHJzIn0.GFrZQ08L-B96nN7dHjAa7g' 
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'ExploreCtrl'
  })

  // realtà aumentata
  .state('tab.compass', {
    url: '/compass',
    views: {
      'tab-compass': {
        templateUrl: 'templates/tab-compass.html',
        controller: 'RealCtrl'
      }
    }
  })

  .state('tab.real', {
    url: '/real',
    views: {
      'tab-real': {
        templateUrl: 'templates/poi-real-camera.html',
        controller: 'RealCameraCtrl'
      }
    }
  })

  // lista degli itinerari
  .state('tab.explore', {
      url: '/explore',
      views: {
        'tab-explore': {
          templateUrl: 'templates/tab-explore.html',
          controller: 'ExploreCtrl'
        }
      }
    })

    // dettaglio del percorso
    .state('tab.detail', {
      url: '/explore/:content/:category',
      views: {
        'tab-explore': {
          templateUrl: 'templates/explore-detail.html',
          controller: 'ExploreDetailCtrl'
        }
      }
    })

    // lista dei punti di interesse
    .state('tab.pois', {
      url: '/pois/:content/:category',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-list.html',
          controller: 'PoiListCtrl'
        }
      }
    })

    // mappa dei punti di interesse
    .state('tab.map', {
      url: '/map/:content/:category',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-map.html',
          controller: 'PoiMapCtrl'
        }
      }
    })

    // dettaglio del POI
    .state('tab.poi', {
      url: '/poi/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-detail.html',
          controller: 'PoiDetailCtrl'
        }
      }
    })

    .state('tab.gallery', {
      url: '/gallery/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-gallery.html',
          controller: 'PoiDetailCtrl'
        }
      }
    })

    .state('tab.i360', {
      url: '/i360/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-i360.html',
          controller: 'PoiDetailCtrl'
        }
      }
    })

    .state('tab.video', {
      url: '/video/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-video.html',
          controller: 'PoiDetailCtrl'
        }
      }
    })

    .state('tab.audio', {
      url: '/audio/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-audio.html',
          controller: 'PoiDetailCtrl'
        }
      }
    })

    .state('tab.route', {
      url: '/route/:content/:category/:idpoi/:lat/:lng',
      views: {
        'tab-explore': {
          templateUrl: 'templates/poi-route.html',
          controller: 'RealMapCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/explore');

});
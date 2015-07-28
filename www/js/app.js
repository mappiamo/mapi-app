// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('gal', ['ionic', 'gal.home.controllers', 'gal.real.controllers', 'gal.explore.controllers', 'gal.services', 'gal.filters', 'gal.weather.services', 'gal.geolocation', 'gal.geojson', 'gal.test', 'gal.utils', 'async.services', 'underscore', 'angular-momentjs', 'cordovaDeviceMotion', 'cordovaCapture', 'turf', 'leaflet-directive'])

.run(function($ionicPlatform, Geolocation) {
  $ionicPlatform.ready(function() {

    Geolocation.watch(function (position) {
      Geolocation.save(position);
    }, function (err) {
      console.log('error to get location...')
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($momentProvider){
  $momentProvider
    .asyncLoading(false)
    .scriptUrl('lib/moment/moment.js');
})

.constant('TEST', {
  url: 'test/data.json',  // nome del database
  value: false
})

.constant('MAPPIAMO', {
  url: 'http://test.mappiamo.org/travotest/index.php?module=api&task=category&object=5&callback=JSON_CALLBACK'    
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('tab.real', {
    url: '/real',
    views: {
      'tab-real': {
        templateUrl: 'templates/tab-real.html',
        controller: 'RealCtrl'
      }
    }
  })

  .state('tab.explore', {
      url: '/explore',
      views: {
        'tab-explore': {
          templateUrl: 'templates/tab-explore.html',
          controller: 'ExploreCtrl'
        }
      }
    })

    .state('tab.list', {
      url: '/explore/:name',
      views: {
        'tab-explore': {
          templateUrl: 'templates/explore-list.html',
          controller: 'ExploreListCtrl'
        }
      }
    })

    .state('tab.map', {
      url: '/map/:name',
      views: {
        'tab-explore': {
          templateUrl: 'templates/explore-map.html',
          controller: 'ExploreMapCtrl'
        }
      }
    })

    .state('tab.detail', {
      url: '/details/:id',
      views: {
        'tab-explore': {
          templateUrl: 'templates/explore-detail.html',
          controller: 'ExploreDetailCtrl'
        }
      }
    })

    .state('tab.search', {
      url: '/search',
      views: {
        'tab-search': {
          templateUrl: 'templates/tab-search.html',
          controller: 'SearchCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

});

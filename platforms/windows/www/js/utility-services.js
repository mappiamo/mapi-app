/*!
 * Copyright 2014 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 *
 */

//////////////////////////////////////////////
// 
// Service Utility
//
//

var app_storage = angular.module('gal.utils', [])

app_storage.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);

app_storage.factory('$utility', function () {

  var utility_json = {

    _directions: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    _directions_extend: ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ovest', 'Ovest', 'Nord-Ovest'],

    _getWindRose: function (degree, extend) {
          var d = _calcDegrees(degree);
          var index = Math.floor((d + 22) / 45);
          var dir;
          if (extend) {
            dir = utility_json._directions_extend[index];
          } else {
            dir = utility_json._directions[index];
          };

          return dir;
    },

    _getDirection: function (degree) {

        /*
        none = 0
        north = 1
        northwest = 2
        northeast = 3
        south = 4
        southeast= 5
        southwest = 6
        west = 7
        east = 8
        */

        var d = _calcDegrees(degree);
        var index = Math.floor((d + 22) / 45) + 1;
        
        return index;

    },

    _getUrlRoute: function (from_lat, from_lng, to_lat, to_lng, key) {

      var url = 'http://open.mapquestapi.com/directions/v2/route?key=' + key + '&destinationManeuverDisplay=true&outFormat=json&routeType=fastest&timeType=1&narrativeType=html&enhancedNarrative=false&shapeFormat=cmp&generalize=0&locale=it_IT&unit=k&from=' + from_lat + ',' + from_lng + '&to=' + to_lat + ',' + to_lng + '&drivingStyle=2&highwayEfficiency=21.0';
      console.log(url);
      return url;
    }
  };

  return utility_json;

});

function _calcDegrees(degree) {
  var d;

  if (parseFloat(degree) > 338) {
    d = 360 - parseFloat(degree);
  } else {
    d = parseFloat(degree);
  };

  return d;
};
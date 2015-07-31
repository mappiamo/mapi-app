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

var ctrls = angular.module('gal.home.controllers', []);

ctrls.controller('HomeCtrl', function($scope, $stateParams, $timeout, Gal, Geolocation) {

  /*

  {"dt":1437998400,
   "main":{
      "temp":29.87,
      "temp_min":28.61,
      "temp_max":29.87,
      "pressure":1021.71,
      "sea_level":1022.06,
      "grnd_level":1021.71,
      "humidity":94,
      "temp_kf":1.26
    },
    "weather":[{
      "id":800,
      "main":"Clear",
      "description":"sky is clear",
      "icon":"01d"
      }],
    "clouds":{
        "all":0
      },
    "wind":{
        "speed":3.36,
        "deg":280.003
      },
    "sys":{
        "pod":"d"
      },
    "dt_txt":
        "2015-07-27 12:00:00"
      }
  */

  Gal.weather(function (err, data) {
    
    console.log('location: ' + JSON.stringify(location));

    var d_sorted = _.sortBy(data, function (item) {
      return Geolocation.distance(item.location.latitude, item.location.longitude);
    });

    $scope.weathers = d_sorted;


    // console.log(JSON.stringify(data[0]));  
  }); 

});


ctrls.controller('SearchCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

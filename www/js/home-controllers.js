var ctrls = angular.module('gal.home.controllers', []);

ctrls.controller('HomeCtrl', function($scope, $stateParams, $timeout, Gal) {

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
    $scope.weathers = data;
    console.log(JSON.stringify(data[0]));  
  }); 

});


ctrls.controller('SearchCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
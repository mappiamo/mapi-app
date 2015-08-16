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

ctrls.controller('HomeCtrl', function ($scope, $stateParams, $timeout, Gal, Geolocation, $ionicLoading, $ionicModal, DataSync) {

  $scope.config = {
    _id: 'config',
    _rev: '',
    data: false,
    media: false
  };

  /*

  {
    "dt":1437998400,
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

  $scope.dataOk = false;
  $scope.isLocated = false;
  $scope.bg = Math.floor((Math.random() * 3) + 1);

  var location = Geolocation.location();

  _refresh();

  $scope.$on('$ionicView.beforeEnter', function() {
    // showSpinner(true);
  });

  $scope.$on('$ionicView.enter', function(e) {
  
  });

  $scope.$watch('config.data', function() {
      if (!$scope.config.data) {
        $scope.config.media = false;
      };
  });

  $scope.$watch('config.media', function() {
      if ($scope.config.media) {
        $scope.config.data = true;
      };
  });

  // Modal per configurazione download
  $ionicModal.fromTemplateUrl('templates/config-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    DataSync.config.get(function (err, data) {
      if (!err) {
        console.log('Getting config: ' + JSON.stringify(data));
        $scope.config = data;
      } else {
        console.log('Error to get config ...');
      }
    });
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    console.log('Config: ' + JSON.stringify($scope.config));
    DataSync.config.save($scope.config, function (err, data) {
      console.log('Save config: ' + JSON.stringify(data));
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
  // *********************************

  $scope.setConfig = function () {
    $scope.openModal();
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

  function _refresh() {

    Gal.weather(function (err, data) {
      
      if (!err) {

        console.log('location: ' + JSON.stringify(location));
        // console.log('Weather: ' + JSON.stringify(data));

        var d_sorted = _.sortBy(data, function (item) {
          return Geolocation.distance(item.item.lat, item.item.lng);
        });

        // $scope.weathers = d_sorted;

        // console.log('Weather: ' + JSON.stringify(d_sorted[0]))

        console.log(JSON.stringify(d_sorted[0].forecast[3].weather));

        $scope.weather_near = d_sorted[0];

        $scope.dataOk = true;
        $scope.isLocated = true;
      };

      showSpinner(false);

    }); 
  };

});


ctrls.controller('SearchCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

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

/*

var ctrls = angular.module('gal.home.controllers', []);

ctrls.controller('HomeCtrl', function ($scope, $stateParams, $timeout, Gal, Geolocation, $ionicLoading, $ionicModal, DataSync, $ionicPopup, $timeout, $ui) {

  // configurazione del download
  $scope.config = {
    _id: 'config',
    _rev: '',
    data: false,
    media: false
  };

  $scope.isSaved = false;

  $ui.get('tab', function (err, result) {
    $scope.uiTab = result;
  });

  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Download dei dati',
      template: 'Il download dei dati può durare molto tempo. Sei sicuro?'
    });
    
    confirmPopup.then(function(res) {
      if(res) {

        console.log('Si. Sono sicuro');
        console.log('Config: ' + JSON.stringify($scope.config));
        
        DataSync.config.save($scope.config, function (err, data) {
          console.log('Save config: ' + JSON.stringify(data));
        });

        // comincia il download dei dati
        // _download();
        DataSync.download(function () {
          console.log('saved ...');
        });

      } else {
        console.log('No. Aspetto un secondo momento.');
      }
    });

  };

  function _download() {
    $scope.isSaved = false;
    $scope.closeModal();
  };

  $scope.saveConfig = function () {
    $scope.showConfirm();
  };

  $scope.download = function () {
    $scope.showConfirm();
  };

  $scope.dataOk = false;
  $scope.isLocated = false;
  $scope.bg = Math.floor((Math.random() * 3) + 1);

  var location = Geolocation.location();

  // _refresh();

  $scope.$on('$ionicView.beforeEnter', function() {
    // showSpinner(true);
  });

  $scope.$on('$ionicView.enter', function(e) {
  
  });

  $scope.$watch('config.data', function() {
      $scope.isSaved = true;
      if (!$scope.config.data) {
        $scope.config.media = false;
      };
  });

  $scope.$watch('config.media', function() {
      $scope.isSaved = true;
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
        $scope.isSaved = false;
      } else {
        console.log('Error to get config ...');
      }
    });
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    if ($scope.isSaved) {
      $scope.showConfirm();
    } else {
      $scope.modal.hide();
    };
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

});

// Ricerca dei contenuti
ctrls.controller('SearchCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
*/

angular.module('CameraPreview', [])

  .factory('$camerapreview', ['$q', function ($q) {

    return window.cordova.plugins.camerapreview;
  }]);
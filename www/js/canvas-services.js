angular.module('CanvasCamera', [])

  .factory('$canvascamera', ['$q', function ($q) {

    return window.plugin.CanvasCamera;
  }]);
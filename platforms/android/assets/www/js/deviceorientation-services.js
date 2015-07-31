angular.module('CordovaDeviceOrientation', [])
  .factory('$cordovaDeviceOrientation', ['$q', function ($q) {
    
    var deviceorientation_json = {
      get: function (done) {
        document.addEventListener("deviceready", function () {
          console.log('device orientation init ...');
          navigator.compass.getCurrentHeading(function (orientation) {
            done(false, orientation);
          }, function () {
            done(true, null);  
          });
        });
      }
    };

    return deviceorientation_json;

}]);
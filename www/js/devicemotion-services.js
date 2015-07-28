angular.module('cordovaDeviceMotion', [])
  .factory('$cordovaDeviceMotion', function($document) {
    
    var devicemotion_json = {
      accelerometer: function (done) {
        document.addEventListener("deviceready", function () {
          console.log('device start ...');
          navigator.accelerometer.getCurrentAcceleration(function (acceleration) {
            done(false, acceleration);
          }, function () {
            done(true, null);  
          });
        });
      },
      watch: function (done) {
        document.addEventListener("deviceready", function () {

          var options = { 
            frequency: 3000 
          };  // Update every 3 seconds

          var watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
            done(false, acceleration, watchID);
          }, function () {
            done(true, null); 
          });
        });    
      },
      clear: function (watch) {
        watch.clearWatch();
      }
    };

    return devicemotion_json;

});
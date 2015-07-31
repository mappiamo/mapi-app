angular.module('CordovaDeviceOrientation', [])
  .factory('$cordovaDeviceOrientation', ['$q', '$localstorage', function ($q, $localstorage) {

    var watch;

    var orientation = {
      magneticHeading: 0,
      trueHeading: 0,
      accuracy: 0,
      timeStamp: 0,
      watchID: 0
    };
    
    var deviceorientation_json = {

      load: function (done) {
        var orientation = $localstorage.getObject('orientation');
        // console.log('get location about ' + location.latitude + ',' + location.longitude);
        done(orientation);
      },

      save: function (orientation) {
        orientation.magneticHeading = result.magneticHeading;
        orientation.trueHeading = result.trueHeading;
        orientation.accuracy = result.headingAccuracy;
        orientation.timeStamp = result.timestamp;

        orientation.watchID = watch;

        $localstorage.setObject('orientation', orientation);

        // console.log('Position: ' + JSON.stringify(location));
      },

      get: function (_onSuccess, _onError) {
        //document.addEventListener("deviceready", function () {
          console.log('device orientation init ...');
          navigator.compass.getCurrentHeading(_onSuccess, _onError);
        //});
      },
      
      watch: function (_onSuccess, _onError) {
        
        var options = {
          frequency: 1000
        };

        console.log('watch orientation ...')

        // document.addEventListener("deviceready", function () {
          watch = navigator.compass.watchHeading(_onSuccess, _onError, options);
        //});

      },

      clear: function () {
        watch.clearWatch();
      }
    };

    return deviceorientation_json;

}]);
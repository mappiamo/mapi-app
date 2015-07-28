angular.module('gal.weather.services', [])

.factory('Weather', function ($http) {

  // Some fake testing data
  var weather_json = {

    get: function(lat, lng, done) {
                    
        var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lng + '&units=metric';
        
        console.log(url);
        
        $http({
          method: 'GET', 
          url: url
        })
          .success(function(data, status, headers, config) {
              console.log('success: ' + data.name);
              done(data.name, data.weather[0].description);
          })
          .error(function(data, status, headers, config) {
              console.log('Unable to get weather');
              throw new Error('Unable to get weather');
          });
    },

    forecast: function(lat, lng, done) {
        
        var url = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lng + '&units=metric';
        
        console.log(url);
        
        $http({
          method: 'GET', 
          url: url
        })
          .success(function(data, status, headers, config) {
              // console.log('success: ' + JSON.stringify(data));
              done(data.list);
          })
          .error(function(data, status, headers, config) {
              var msg = 'Unable to get weather by ' + url
              console.log(msg);
              throw new Error(msg);
          });
    }

  };

  return weather_json;
});

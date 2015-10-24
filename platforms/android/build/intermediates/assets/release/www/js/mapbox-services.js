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
 
angular.module('gal.mapbox', [])
	.factory("MapBox", function ($http, _, async, S, MAPBOX) {

	return {

		direction: function (start, end, profile_index, done) {

			var profiles = ['mapbox.driving', 'mapbox.walking', 'mapbox.cycling'];
			var p;

			var p = profiles[profile_index]; 

			var url = 'https://api.mapbox.com/v4/directions/' + p + '/' + 
					  start.longitude + ',' + start.latitude + ';' +
					  end.longitude + ',' + end.latitude + '.json?access_token=' + MAPBOX.access_token;

			var options = {
	          method: 'GET', 
	          url: url
	        };

	        console.log('Getting data directions by ' + url)
        
	        $http(options)
	          .success(function(data, status, headers, config) {
	              // console.log('*** success route data : ' + JSON.stringify(data));
	              done(false, data);
	          })
	          .error(function(data, status, headers, config) {
	              console.log('Unable to get data geojson mapbox direction');
	              done(true, null);
	          });
			}
	};	

});
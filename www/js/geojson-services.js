/*!
 * Copyright 2014 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 *
 */

//////////////////////////////////////////////
// 
// Service GEOJSON
//
//

var service = angular.module('gal.geojson', []);

service.factory('GeoJSON', function (_, async) {

	var geojson_json = {

		/////////////////////////////////////////
	    // 
	    // creo il file geojson

		create: function (input, callback_service) {

			var data_geojson = {
			  type : "FeatureCollection",
			  features: []
			};

			console.log('create geojson ...');

			async.each(input, function (item, callback) {
		        
		        var feature = { 
		          type: "Feature", 
		          properties: {
		          	title: item.title,
		          	address: item.address,
		          	marker: item.meta[1].value
		          }, 
		          "geometry": { 
		              type: "Point", 
		              "coordinates": [ Number(item.lon), Number(item.lat) ] 
		          }
		        };

		        data_geojson.features.push(feature);
		        
		        callback();

		    }, function (err) {
		    	console.log('geojson created ' + _.size(data_geojson.features) + ' elements.')
		        callback_service(err, data_geojson);
		    });
		}
	};

	return geojson_json;

});
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

service.factory('GeoJSON', function (_, async, S, Gal, $geo, $filters) {

	var geojson_json = {

		geojson_data: { 
			"type": "FeatureCollection",
			"features": []
		},

		route: function (route_str, color, callback_service) {

			var route_array = route_str.split(',');
			var r = [];

			var data_geojson = {
		  		type : "FeatureCollection",
		  		features: []
			};

			async.each(route_array, function (item, callback) {
				var si = S(item).trim().s
				r.push(si.split(' ').map(Number));
				callback();
			}, function (err) {

				console.log(r[0]);

				var feature = { 
		          type: "Feature", 
		          properties: {
		          	color: color
		          }, 
		          "geometry": { 
		              type: "LineString", 
		              coordinates: r 
		          }
		        };

		        data_geojson.features.push(feature);

		        // console.log('geojson created ' + JSON.stringify(data_geojson.features[0]));
		        callback_service(err, data_geojson);
			});

		},

		/////////////////////////////////////////
	    // 
	    // creo il file geojson

		create: function (input, callback_service) {

			var data_geojson = {
			  type : "FeatureCollection",
			  features: []
			};

			console.log('create geojson ...');

			async.each(input.data, function (item, callback) {
		        
				if (item.type == "place") {

					console.log(JSON.stringify(item));

			        var feature = { 
			          type: "Feature", 
			          properties: {
			          	id: item.id,
			          	title: item.title,
			          	address: item.address,
			          	marker: item.meta[1].value,
			          	lat: item.lat,
			          	lon: item.lon
			          }, 
			          "geometry": { 
			              type: "Point", 
			              "coordinates": [ Number(item.lon), Number(item.lat) ] 
			          }
			        };

			        data_geojson.features.push(feature);
			    };
		        
		        callback();

		    }, function (err) {
		    	console.log('geojson created ' + _.size(data_geojson.features) + ' elements.');
		    	console.log(JSON.stringify(data_geojson));
		        callback_service(err, data_geojson);
		    });
		},

		content: function (content, done) {
			var self = this;

			this.geojson_data.features = [];

			var options = {
				content: content,
				byUrl: false
			};

			Gal.content(function (err, data) {

				var dt = data.data;

				var geometry = $geo.parse(dt.route);

		        var feature = {
		          "type": "Feature",
		          "geometry": geometry,
		          "properties": {
		          	id: dt.id,
		            content: content,
		            category: '',
		            type: dt.type,
		            title: dt.title,
		            time: dt.meta[1].value,
		            mezzi: dt.meta[2].value,
		            start: dt.meta[4].value,
		            end: dt.meta[5].value,
		            color: dt.meta[0].value,
		            description: '<h2>' + dt.title + '</h2>' +
                                 '<p>Tempo di percorrenza in giorni: ' + dt.meta[1].value + '</p>'
		          }
		        };

		        self.geojson_data.features.push(feature);

		        done(err, self.geojson_data);
			}, options);
		},

		poi_all: function (done) {

			var self = this;

			this.geojson_data.features = [];

			var options = {
				all: true,  // tutti i POI
		      	category: null, 
		      	content: null, 
		      	poi: null, 
		      	filters: null,
		      	nearest: true,
		      	limit: 10,
		      	lat: 0,
		      	lng: 0
			};

			this.pois(function (err, geojson) {
				var key = "type";
				var value = "place";
				var filtered = turf.filter(geojson, key, value);
				done(err, filtered);
			}, options);

		},

		poi_nearest: function (done, lat, lng, geojson) {
			var self = this;

			var point = {
			  "type": "Feature",
			  "properties": {},
			  "geometry": {
			    "type": "Point",
			    "coordinates": [lng, lat]
			  }
			};

			var key = "type";
			var value = "place";
			var filtered = turf.filter(geojson, key, value);

			var nearest = turf.nearest(point, filtered);
			nearest.properties['color'] = '#f00';

			var n = { 
				"type": "FeatureCollection",
    			"features": []
    		};

    		n.features.push(nearest);

			var distance = turf.distance(point, nearest, 'kilometers');

			done(false, n, distance);
		},

		_pois: function (done, options) {

			var self = this;

			console.log('search pois by ' + options.category + ' and ' + options.poi );

			var options_poi = {
				content: options.content,
				category: options.category,
				idpoi: options.poi,
				byUrl: false
			};

			console.log(JSON.stringify(options_poi));

			Gal.poi(function (err, data) {

				// console.log(JSON.stringify(data));

				console.log('loaded pois. Start convert to geojson n.' + _.size(data));

				var d;

				if (typeof data.data === 'undefined') {
					console.log('***> send data to geojson')
					d = data;
				} else {
					//d = data.data;
					console.log('*** send data filtered to geojson filtered ... n.' + _.size(data.filtered));
					d = data.filtered;
				};

				async.each(d, function (item, callback) {

					if (options.all && item.type === 'route') {
						callback();
					} else {
						var geometry = $geo.parse(item.route);

				        var feature = {
				          "type": "Feature",
				          "geometry": geometry,
				          "properties": {
				            id: item.id,
				            content: options_poi.content,
				            category: options_poi.category,
				            type: item.type,
				            title: item.title,
				            address: item.address,
				            marker: item.meta[1].value,
				            color: '',
				            lat: item.lat,
				            lon: item.lon
				          }
				        };

				        if (item.type === 'route') {
				        	console.log('Color:' + item.meta[0].value);
				        	feature.properties.color = item.meta[0].value;
				        } else {
				        	feature.properties.color = '#FFFFFF'
				        };

			        	self.geojson_data.features.push(feature);

			        	console.log('*********************************');
				    	console.log('*** GeoJSON : ' + JSON.stringify(self.geojson_data));
				
			        	callback();
			        };

		      	}, function (err) {

		      		if (typeof done === 'function') {
		      			done(err);
		      		};

				});

				// self._pois_geojson(d, options, done);
				
		  	}, options_poi);

		},

		// crea il file geojson con tutti i punti di interesse per una categoria
		pois: function (done, options) {

			var self = this;

			console.log('create geojson ... ');

			if (!options.all) {
				this.geojson_data.features = [];
				self._pois(function (err) {
					if (typeof done === 'function') {
						// console.log('*** GeoJSON: ' + JSON.stringify(self.geojson_data));
						done(err, self.geojson_data);
					};
				}, options);
			} else {
				Gal.getRoutes(function (err, routes) {
					async.each(routes, function (item, callback) {
						
						options.category = item._categories;
						options.content = item._content;
						options.poi = null;

						console.log(JSON.stringify(options))

						self._pois(function (err) {
							callback();
						}, options);
					}, function (err) {
						if (typeof done === 'function') {
							done(err, self.geojson_data);
						}
					});
				});
				
			};
		}
	};

	return geojson_json;

});
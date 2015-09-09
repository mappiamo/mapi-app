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

service.factory('GeoJSON', function (_, async, S, Gal, $geo) {

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

			Gal.content(content, function (err, data) {

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
			});
		},

		poi_nearest: function (data, done) {
			var self = this;
			this.geojson_data.features = [];

			// console.log('Data to convert: ' + JSON.stringify(data));

			this._pois_geojson(data, null, null, function (err) {
				done(err, self.geojson_data);
			}, true);
		},

		_pois_geojson: function (data, content, category, done, nearest) {

			var self = this;
			var co;
			var ca;

			async.each(data, function (item, callback) {
				var it;

				if (nearest) {
					console.log(JSON.stringify(item));
					it = item.item;
					co = item.content._content;
					ca = item.content._categories;
				} else {
					it = item;	
					co = content;
					ca = category;
				};

				console.log('content-category: ' + co + ',' + ca);
		        
		        var geometry = $geo.parse(it.route);

		        var feature = {
		          "type": "Feature",
		          "geometry": geometry,
		          "properties": {
		            id: it.id,
		            content: co,
		            category: ca,
		            type: it.type,
		            title: it.title,
		            address: it.address,
		            marker: it.meta[1].value,
		            color: '',
		            lat: it.lat,
		            lon: it.lon
		          }
		        };

		        if (item.type === 'route') {
		        	console.log('Color:' + it.meta[0].value);
		        	feature.properties.color = it.meta[0].value;
		        } else {
		        	feature.properties.color = '#FFFFFF'
		        };

		        self.geojson_data.features.push(feature);
		        callback();

		      }, function (err) {

		      	if (typeof done === 'function') {
		      		done(err);
		      	};

		      });
		},

		_pois: function (category, content, idpoi, done) {

			var self = this;

			console.log('search pois by ' + category + ' and ' + idpoi );

			Gal.poi(category, idpoi, function (err, data) {

				console.log(JSON.stringify(data));

				var d;

				if (typeof data.data === 'undefined') {
					d = data;
				} else {
					d = data.data;
				};

				self._pois_geojson(d, content, category, done);
		  	});

		},

		// crea il file geojson con tutti i punti di interesse per una categoria
		pois: function (done, all, category, content, idpoi) {

			var self = this;

			if (!all) {
				this.geojson_data.features = [];
				self._pois(category, content, idpoi, function (err) {
					if (typeof done === 'function') {
						done(err, self.geojson_data);
					};
				});
			} else {
				async.each(Gal.routes, function (item, callback) {
					self._pois(item._categories, content, null, function (err) {
						callback();
					});
				}, function (err) {
					if (typeof done === 'function') {
						done(err, self.geojson_data);
					}
				});
			};
		}
	};

	return geojson_json;

});
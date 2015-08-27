angular.module('gal.sync', [])

.factory('DataSync', function ($http, async, _, MAPPIAMO, Geolocation, MAPQUEST, $utility, DB, Gal, pdb) {

	var db;
	var data_json = [];
	var pois_json = [];

	// Some fake testing data
	var sync_json = {

		config: {

			get: function (done) {

				pdb.open(DB.name, function (db_callback) {
					db = db_callback;
					console.log('get document config' + JSON.stringify(db));
					pdb.get(db, 'config', function (err, data) {
						console.log('get config: ' +  JSON.stringify(data));
						done(err, data);
					});
				});
			},

			save: function (config_json, done) {

				pdb.open(DB.name, function (db_callback) {
					db = db_callback;

					// console.log('save data config: ' + JSON.stringify(config_json));

					pdb.put(db, config_json, function (err, data) {
						done(err, data);
					});
				});	
			}
		},

		_content: function (done) {

			async.each(Gal.routes, function (item, callback_child) {

				var id = item._content.toString();

				Gal.content(item._content, function (err, data) {

					if (!err) {

						var m = _getmedia(_, item.media);
						var d = Gal.item();

						d._content = id;
						d.name = data.name;
						d.data = data;
						d.media = data.media;

						data_json.push(d);

						pdb.put(db, d, function (err, data_put) {
							callback_child(err);
						});

					} else {
						callback_child();
					}
				});

			}, function (err) {
				done(err, 'next');
			});
		},

		_poi: function (pois, id, done) {

			async.each(pois, function (item, callback) {

				// console.log('------------')
				// console.log('Poi:' + JSON.stringify(item));
				
				var m = _getmedia(_, item.media);
				var d = Gal.item();

				d._content = id;
				d._category = item.id.toString();
				d.name = item.name;
				d.data = item;
				d.media = item.media;

				pois_json.push(d);
				
				pdb.put(db, d, function (err, data) {
					callback(err);
				});

			}, function (err) {
				done(err);
			});

		},

		_pois: function (done) {

			async.each(Gal.routes, function (item, callback_child) {

				Gal.poi(item._content, null, function (err, data) {
					
					if (!err) {

						console.log('------------')
						console.log('Pois n.' + _.size(data));

						sync_json._poi(data, function (err) {
							callback_child(err);
						});

					} else {
						callback_child();
					}
				});

			}, function (err) {
				done(err, 'done');
			});
		},

		saveImage: function (id, index, title, buffer, done) {
			pdb.open(DB.name, function (db_callback) {
				db = db_callback;
				var i = 0;
				
				if (typeof index !== undefined || index != null) {
					i = index;
				};

				console.log('saving image by ' + id);
				pdb.putAttachment(db, id, i, title, buffer, function (err, result) {
					done(err, result);
				});
			});
		},

		getImage: function (id, index, title, done) {
			pdb.open(DB.name, function (db_callback) {
				db = db_callback;
				console.log('getting image by ' + id);
				pdb.getAttchment(db, id, index, title, function (err, blob) {
					done(err, blob);
				});
			});
		},

		download: function (done) {

			async.series([

				// cancello il database
				function (callback) {
					pdb.close(DB.name, function (err) {
						callback(err, 'next');
					});
				},
				
				// creo il database
				function (callback) {
					pdb.open(DB.name, function (db_callback) {
						db = db_callback;
						callback(false, 'next');
					});	
				}, 

				sync_json._content,
				sync_json._pois
			], function (err, result) {
				console.log('done download');
				console.log('data n.' + _.size(data_json));
				console.log('pois n.' + _.size(pois_json));
				done(err, data_json, pois_json);
			});
		}
	};

	return sync_json;

});

function _getmedia(_, media) {
	var m = {}

	if (_.size(media) > 0) {
		m = {
			title: media[0].title + '.jpg',
			url: media[0].url
		};	
	};

	return m;
}
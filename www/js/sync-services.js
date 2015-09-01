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

				Gal.content(item._content, function (err, data) {

					// console.log('----------------------------------');
					// console.log('Data ---> ' + JSON.stringify(data));

					data_json.push(data);
					callback_child();
				});

			}, function (err) {
				pdb.bulkDocs(db, data_json, function (err, response) {
					console.log(JSON.stringify(response) + ' - Error: ' + err);
					done(err, 'next');
				});
			});
		},

		_pois: function (done) {

			var self = this;

			async.each(Gal.routes, function (item, callback_child) {
				Gal.poi(item._categories, null, function (err, data) {
					if (!err) {
						console.log('saving poi n:' + _.size(data));
						pdb.bulkDocs(db, data, function (err, response) {
							console.log(JSON.stringify(response) + ' - Error: ' + err);
							callback_child();
						});
					} else {
						callback_child();
					}
				});

			}, function (err) {
				console.log('saving poi done.');
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

		download: function (done, reset) {

			var self = this;

			async.series([

				// cancello il database
				function (callback) {
					if (reset) {
						pdb.close(DB.name, function (err) {
							callback(err, 'next');
						});
					} else {
						callback(false, 'next');
					}
				},
				
				// apro il database
				function (callback) {
					pdb.open(DB.name, function (db_callback) {
						db = db_callback;
						db.info().then(function (info) {
						  console.log(info);
						});
						//console.log('database: ' + JSON.stringify(db));
						callback(false, 'next');
					});	
				}, 
				self._content,
				self._pois
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
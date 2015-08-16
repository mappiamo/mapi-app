angular.module('gal.sync', [])

.factory('DataSync', function ($http, async, _, MAPPIAMO, Geolocation, MAPQUEST, $utility, DB, Gal, pdb) {

	var db;

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

					console.log('save data config: ' + JSON.stringify(config_json));

					pdb.put(db, config_json, function (err, data) {
						done(err, data);
					});
				});	
			}
		},

		download: function (done) {

		}

	};

	return sync_json;

});
/*!
 * Copyright 2014 Giuseppe Zileni
 * http://giuseppezileni.github.io
 *
 * Ionic, v1.0.0
 * http://ionicframework.com/
 *
 * By @gzileni
 *
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */

//////////////////////////////////////////////
// 
// airQ App - Service PouchDB
//
//

var service = angular.module('pouchdb.services', ['pouchdb']);

service.factory('pdb', function (pouchDB) {

	var pouchdb_json = {

		// apre il database
		open: function (name, callback) {
			
			var db = pouchDB(name);
			
			if (typeof callback === 'function') {
				callback(db);
			};

		},

		// chiude il database
		close: function (name, callback) {
			
			pouchdb_json.open(name, function (db) {
				db.destroy().then(function () {
				  // success
				  if (typeof callback === 'function') {
				  	callback(false)
				  }
				}).catch(function (error) {
				  	console.log(error);
					callback(error)  
				});
			});
		},

		// aggiunge un documento
		put: function (db, data, callback) {

			console.log('saving ' + JSON.stringify(data));

			pouchdb_json.get(db, data._id, function (err, doc) {
				
				if (!err) {
					data._rev = doc._rev;
				};
				
				console.log('saving _rev: ' + JSON.stringify(data));

				var response = db.put(data);

				console.log('response saving ' + JSON.stringify(response));

				if (typeof callback === 'function') {
		  			callback(false, response);
		  		};

			});
		},

		// legge un documento
		get: function(db, id, callback) {
			
			console.log('getting doc by id: ' + id);

			db.get(id).then(function (doc) {
			  // handle doc
			  	console.log('doc founded ' + JSON.stringify(doc));
				if (typeof callback === 'function') {
					callback(false, doc)
				}  
			}).catch(function (err) {
			  	console.log('error to get: ' + err);
			  	if (typeof callback === 'function') {
			  		callback(true, null)
			  	}
			});

		},

		// cancella un documento
		delete: function (db, id, callback) {

			pouchdb_json.get(db, id, function (err, doc) {
				if (!err) {
					var response = db.remove(doc);
					if (typeof callback === 'function') {
			  			callback(false, response);
			  		}
				} else {
					if (typeof callback === 'function') {
			  			callback(true, null);
			  		}
				}
			});
		}
	};

	return pouchdb_json;

});
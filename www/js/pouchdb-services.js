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
			
			var db = pouch(name);
			
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

			// console.log('saving ' + JSON.stringify(data));

			pouchdb_json.get(db, data._id, function (err, doc) {
				
				if (!err) {
					data._rev = doc._rev;
				};
				
				// console.log('saving _rev: ' + JSON.stringify(data));

				var response = db.put(data);

				console.log('response saving ' + JSON.stringify(response));

				if (typeof callback === 'function') {
		  			callback(false, response);
		  		};

			});
		},

		getAttachment: function (db, id, index, title, callback) {

			var idI = id + '_' + index;

			db.getAttachment(idI, title).then(function (blob) {
			  callback(false, blob);
			}).catch(function (err) {
			  console.log(err);
			  callback(true, null);
			});

		},

		putAttachment: function (db, id, index, title, buffer, callback) {

			var rev = '';
			var idImg = id + '_' + index;
			
			var mime = 'image/jpeg';

			var attachment = new Blob([buffer], {
					type: mime
				});

			db.putAttachment(idImg, title, attachment, mime).then(function (result) {
			  // handle result
			  console.log('image saved.');
			  callback(false, result);
			}).catch(function (err) {
			  console.log(err);
			  callback(true, null);
			});

		},

		// legge un documento
		get: function(db, id, callback) {
			
			console.log('getting doc by id: ' + id);

			db.get(id).then(function (doc) {
			  // handle doc
			  	// console.log('doc founded ' + JSON.stringify(doc));
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
		},

		_dataURItoBlob: function (dataURI, mime) {
		    // convert base64 to raw binary data held in a string
		    // doesn't handle URLEncoded DataURIs

		    var byteString = atob(dataURI);

		    // separate out the mime component


		    // write the bytes of the string to an ArrayBuffer
		    //var ab = new ArrayBuffer(byteString.length);
		    var ia = new Uint8Array(byteString.length);
		    for (var i = 0; i < byteString.length; i++) {
		        ia[i] = byteString.charCodeAt(i);
		    }

		    // write the ArrayBuffer to a blob, and you're done
		    var blob = new Blob([ia], { type: mime });

		    return blob;
		},

		_getImageUrltoBlob: function (url, done) {

			var blob;

			// Simulate a call to Dropbox or other service that can
			// return an image as an ArrayBuffer.
			var xhr = new XMLHttpRequest();

			// Use JSFiddle logo as a sample image to avoid complicating
			// this example with cross-domain issues.
			xhr.open( "GET", url, true );

			// Ask for the result as an ArrayBuffer.
			xhr.responseType = "arraybuffer";

			xhr.onload = function( e ) {
		    	// Obtain a blob: URL for the image data.
		    	var arrayBufferView = new Uint8Array( this.response );
		    	blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
		    	done(blob);
		    };

		}
	};

});
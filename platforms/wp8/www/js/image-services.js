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
 
angular.module('gal.images', ['base64'])

.factory('$download', function () {
	return window.download;
})

.factory('$image', function ($http, $base64, async, _, Geolocation, pdb, DB, $getImageData, $download) {

	var image_json = {
		getData: function (media, done) {

			var images = [];

			// console.log('Data Media: ' + JSON.stringify(media));

			async.each(media, function (item, callback) {

				// controllo se esiste nel database
				
				var img = {
					_id: item.title,
					_rev: '',
					url: '',
					data: ''
				};

				img.url = item.url;
				var options = {
					responseType: 'arraybuffer'
				};

				$http.get(img.url)
         			.then(function(response) {  
         			
         			img.data = response.data;

         			images.push(img);
 					callback(false);
         		});


			}, function (err) {
				// console.log('Data media converted: ' + JSON.stringify(images));
				done(err, images);
			});

		}
	};

	return image_json;

});

function _getBlob(url, done) {
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);

	xhr.responseType = 'blob';

	xhr.onload = function(e) {
  		if (this.status == 200) {
			var blob = this.response;
			var src = window.URL.createObjectURL(blob)
			done(false, src);
  		}
	};

	xhr.onerror = function(e) {
  		console.log("Error " + e.target.status + " occurred while receiving the document.");
		done(true, '');
	};

	xhr.send();
}

function _utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
};

function _geturlBase64(data) {

	var arrayBufferView = new Uint8Array( data );
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL( blob );

    return imageUrl;
};

function _arrayBufferToBase64(uarr) {
    var strings = [];
    var chunksize = 0xffff;
    var len = uarr.length;

    for (var i = 0; i * chunksize < len; i++){
        strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
    }

    return strings.join("");
}
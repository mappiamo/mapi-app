angular.module('cordovaCapture', [])
  .factory('$cordovaCapture', function($q, $window) {

  	var capture_json = {

  		getImage: function (done) {

  			console.log('getImage start ...');

  			var deferred = $q.defer();

  			if(!$window.navigator) {
	          deferred.reject(new Error('Geolocation is not supported'));
	        } else {
	          var pictureSource = $window.navigator.camera.PictureSourceType;
	    		var destinationType = $window.navigator.camera.DestinationType;

	    		var options = { 
	    			quality: 50,
	    			destinationType: destinationType.DATA_URL 
	    		};

	    		$window.navigator.camera.getPicture(function (imageData) {
	    			done(false, imageData);
	    			/*
	    			var smallImage = document.getElementById(IdElement);
					smallImage.style.display = 'block';
	  				smallImage.src = "data:image/jpeg;base64," + imageData;
	  				*/
	    		}, function (message) {
	    			deferred.reject;
	    			console.log('Failed because: ' + message);
	    			done(true, null);
	    		}, options);
	        }
  		}
  	};

  	return capture_json;
  
  });

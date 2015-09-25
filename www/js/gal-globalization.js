var service = angular.module('gal.globalization', []);

// Geolocation
service.factory('$language', function ($localstorage, $cordovaGlobalization) {

	var global = {

		get: function (done) {

			var location = $localstorage.getObject('language');
			
			console.log('Language in memory saved: ' + location);

			if (location != 'it' && location != 'en' && typeof location == 'undefined') {
				try {
				    $cordovaGlobalization.getPreferredLanguage().then(
					    function(result) {
					    	// salva il tipo di linguaggio
					      	done(false, result);
					    },
					    function(error) {
					    	// error
					    	done(true, null);
				  	});
				}
				catch(err) {
				    done(false, 'it');
				}
			} else {
				done(false, location);
			}
		},
		save: function (lang) {
			console.log('saving language: ' + lang);
			$localstorage.setObject('language', lang);
		}
	};

	return global;

});
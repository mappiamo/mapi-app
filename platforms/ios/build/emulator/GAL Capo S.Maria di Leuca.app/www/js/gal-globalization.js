var service = angular.module('gal.globalization', []);

// Geolocation
service.factory('$language', function ($localstorage, $cordovaGlobalization) {

	var global = {

		get: function (done) {

			var language = $localstorage.getObject('language');
			console.log('Language in memory saved: ' + JSON.stringify(language));

			if (typeof location === 'undefined' || JSON.stringify(language) == '{}') {
				done(false, 'it');	
			} else {
				done(false, language);
			};

			/*
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
			*/
		},
		save: function (lang) {
			console.log('saving language: ' + lang);
			$localstorage.setObject('language', lang);
		}
	};

	return global;

});
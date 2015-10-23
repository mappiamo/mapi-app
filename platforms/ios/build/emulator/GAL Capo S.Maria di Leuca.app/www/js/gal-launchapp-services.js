var service = angular.module('gal.launchapp', [])

service.factory('$app', function($cordovaDevice, $startApp, REALITY, $cordovaAppAvailability) {

	var launchApp = {

		infoDevice: function () {

			var self = this;

			var deviceInfo = {
		    	device: $cordovaDevice.getDevice(),
		    	cordova: $cordovaDevice.getCordova(),
		    	model: $cordovaDevice.getModel(),
		    	platform: $cordovaDevice.getPlatform(),
		    	UUID: $cordovaDevice.getUUID(),
		    	version: $cordovaDevice.getVersion()
		    };

		    console.log(JSON.stringify(deviceInfo));

		    return deviceInfo;

		},

		map: function (location, done) {

			var self = this;

			try {

				var di = this.deviceInfo();
		    
			    if (di.platform == 'Android') {
					// console.log('run App: ' + REALITY.android.url);
					//var appRoute = 'geo:' + lat + ',' + lng + '?z=12';
					var appRoute = 'http://maps.google.com/?ll=' + location.latitude + ',' + location.longitude;
					console.log('run App Android: ' + appRoute);
					$startApp.run(appRoute, function (err, message) {
						done(false, message, false);
					});
				} else if (di.platform == 'iOS') {
					//var appRoute = 'maps://?ll=' + lat + ',' + lng;
					var appRoute = 'http://maps.apple.com/?ll=' + location.latitude + ',' + location.longitude;
					console.log('run App iOS: ' + appRoute);
					$startApp.run(appRoute, function (err, message) {
						done(false, message, false);
					});
				/*
				} else if (di.platform == 'WinCE' || di.platform == 'Win32NT') {
					var appRoute = 'bingmaps:?cp=' + lat + '~' -74.006076
					var appRoute = 'maps:' + lat + ' ' + lng;
					console.log('run App WP: ' + appRoute);
					$startApp.run(appRoute, function (err, message) {
						done(false, message, false);
					});
				*/
				} else {
					done(false, '', true);
				};
			} catch (e) {
				var msg = 'non posso lanciare il navigatore.';
				console.log(msg);
				done(true, msg, true);
			};

		},

		checkApp: function (nameApp) {

			$cordovaAppAvailability.check(nameApp)
				.then(function() {
					// is available
					return true;
				}, function () {
					// not available
					return false;
			});

		},

		reality: function (done) {

			var self = this;
			var msg;
			var nameApp = '';
			var err = false;

			try {

				var di = this.deviceInfo();

				if (di.platform == 'Android') {
					nameApp = REALITY.android.url;
				} else if (di.platform == 'iOS') {
					nameApp = REALITY.iOS.url;
				} else {
					msg = 'Questa funzione è disponibile solo per sistemi Android e IOS';
				};

				if (self.checkApp(nameApp)) {
					console.log('run App: ' + nameApp);
					$startApp.run(nameApp, function (err, message) {
						msg = message;
						done(err, self.deviceInfo, msg);
					});	
				} else {

					msg = 'Non ho trovato l\'App Gal Leuca Reality';

					var appStore = '';
					
					if (di.platform == 'Android') {
						appStore = REALITY.android.store;
					} else if (di.platform == 'iOS') {
						appStore = REALITY.iOS.store;
					} else {
						msg = 'Questa funzione è disponibile solo per sistemi Android e IOS';
						err = true;
					};

					$startApp.run(appStore, function (err, message) {
						msg = message;
						done(err, self.deviceInfo, msg);
					});
				};
			} catch(err) {
			    console.log('device don\'t start');
			    done(true, self.deviceInfo, 'device don\'t start');
			};
		}
	};

	return launchApp;

});
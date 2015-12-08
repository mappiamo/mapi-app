angular.module('gal.tab', ['ionic'])

.factory('$tab', function ($cordovaDevice, $ui) {

	var tab = {
		get: function (done) {
			var self = this;

			$ui.get('tab', function (err, langTab) {

				var tabs;
      			var platform;

      			try {
      				platform = $cordovaDevice.getPlatform();
      			} catch (err) {
      				platform = 'web';
      			};

			    // console.log('Device: ' + JSON.stringify($scope.deviceInfo));

			    tabs = self.tabs;
			    tabs.title = langTab;

			    tabs.switches[0] = true;
				tabs.switches[1] = true;
				tabs.switches[2] = false;
				tabs.switches[3] = true;
				tabs.switches[4] = true;

				var isWebView = ionic.Platform.isWebView();
				var isIPad = ionic.Platform.isIPad();
				var isIOS = ionic.Platform.isIOS();
				var isAndroid = ionic.Platform.isAndroid();
				var isWindowsPhone = ionic.Platform.isWindowsPhone();

				console.log('is Web View: ' + isWebView);
				console.log('is isWindowsPhone: ' + isWindowsPhone);

				if (isWindowsPhone) {
					platform = 'web';
				};

				console.log('Platform: ' + platform);
			
				if (platform == 'web') {
					tabs.switches[0] = true;
					tabs.switches[1] = false;
					tabs.switches[2] = false;
					tabs.switches[3] = true;
					tabs.switches[4] = true;
				};
				
				done(err, tabs);

    		});
			
		},

		tabs: {
			title: ['','',''],
			switches: [true, false, false, true]
		}
	};

	return tab;

});
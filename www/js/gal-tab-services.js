angular.module('gal.tab', [])

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
			
				if (platform == 'Android' || platform == 'iOS') {
					tabs.switches[0] = true;
					tabs.switches[1] = true;
					tabs.switches[3] = false;
					tabs.switches[3] = true;
				} else {
					tabs.switches[0] = true;
					tabs.switches[1] = false;
					tabs.switches[2] = true;
					tabs.switches[3] = true;
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
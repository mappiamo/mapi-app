angular.module('gal.ui', [])

.factory('$ui', function ($language) {

	var ui = {
		get: function (uiIndex, done) {
			var self = this;
			$language.get(function (err, result) {
				
				var list;

				// home page
				if (uiIndex == 'home') {
					if (result == 'it') {
						list = self.home.it;
					} else if (result == 'en') {
						list = self.home.en;
					}
				};

				if (uiIndex == 'map') {
					if (result == 'it') {
						list = self.map.it;
					} else if (result == 'en') {
						list = self.map.en;
					}
				};

				if (uiIndex == 'tab') {
					if (result == 'it') {
						list = self.tab.it;
					} else if (result == 'en') {
						list = self.tab.en;
					}
				};

				if (uiIndex == 'poilist') {
					if (result == 'it') {
						list = self.poilist.it;
					} else if (result == 'en') {
						list = self.poilist.en;
					}
				};

				if (uiIndex == 'poidetail') {
					if (result == 'it') {
						list = self.poidetail.it;
					} else if (result == 'en') {
						list = self.poidetail.en;
					}
				};

				done(err, list);

			});
		},
		home: {
			it: ['Benvenuto nel Salento', 'Seleziona uno degli itinerari del territorio'],
			en: ['Welcome to Salento', 'Select one of the routes of the area']
		},
		map: {
			it: ['Dettagli', 'Filtri', 'Lista POI'],
			en: ['Details', 'Filters', 'POI list']
		},
		tab: {
			it: ['Home', 'Realtà aumentata', 'Bussola'],
			en: ['Home', 'Reality', 'Compass']
		},
		poilist: {
			it: ['Distanza dalla tua posizione:'],
			en: ['Distance from your location:']
		},
		poidetail: {
			it: ['Dettaglio POI'],
			en: ['POI Details']
		}
	};

	return ui;

});
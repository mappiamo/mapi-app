var GalUI = {

	options: {
		geojson: false,
		reset: true,
		latitude: 0,
		longitude: 0,
		geolocation: false
	},

	_loadPOIs: function () {
		Gal.loadData(function (err, against) {

			console.log(JSON.stringify(against));
			if (!err) {
          		$( "#real" ).show();
          	};

		}, this.options);
	},

	loadPOIS: function () {
		var self = this;
		
		$( "#real" ).hide();

		if (self.options.geolocation) {

			navigator.geolocation.getCurrentPosition(function (position) {
				self.options.latitude = position.coords.latitude;
				self.options.longitude = position.coords.longitude;
				self._loadPOIs();
			}, function (err) {
				options.reset = true;
				console.log("Not able to fetch location.");
				self._loadPOIs();
			});

		} else {
			self._loadPOIs();
		}
	},

	load: function () {
		
		var self = this;
		var h = '';

		$('#explore').empty();
		console.log('loading App data ...');

		$.each(Gal.routes, function (key, route) {

			console.log('loading :' + JSON.stringify(route));

			h += '<li><a href="#">' +
					'<img src="' + route.image + '">' + 
					'<h2>' + route.title + '</h2></a>' +
					// '<p>' + route.description + '</p></a>' +
					'</li>';
			
		});

		$('#content').html(h);

		self.loadPOIS();       
	}	
};
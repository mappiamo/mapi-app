var GalUI = {

	loadPOIS: function () {
		$( "#real" ).hide();
		Gal.loadData(function (err, data) {
			if (!err) {
          		$( "#real" ).show();
          	};
        });
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
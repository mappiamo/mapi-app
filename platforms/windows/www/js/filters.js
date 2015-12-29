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

var filters = angular.module('gal.filters', []);

filters.filter("stars", ['$sce', function($sce) {

	return function(input){

		console.log(input);

		var h = '';

		for (var i = 1; i <= input; i++) {
			h += '<i class="icon ion-ios-star"></i>';
		};

		var r = $sce.trustAsHtml(h);

		console.log(r);

		return r;
	}
}]);

filters.filter("magnetic", function ($utility) {

	return function (input) {

		var d = $utility._getWindRose(input);
		console.log('Direzione: ' + d); 
		return d;

	};

});

filters.filter("image_thumb", function (_) {

	return function (input) {

		var i = '';
		//console.log('input n.' + _.size(input));
		//console.log('data input: ' + JSON.stringify(input));
		var d = _.find(input.meta, function (item) {
			return item.name == 'image0_thumb_small'
		});

		if (typeof d != 'undefined') {
			i = d.value;
		} else {
			i = input.media[0].url;
		}

		return i;

	};

});

filters.filter("magnetic_ext", function ($utility) {

	return function (input) {

		var d = $utility._getWindRose(input,true);
		console.log('Direzione: ' + d); 
		return d;

	};

});

filters.filter("background", function () {
	return function (input) {

		var b;

		if (input === 1) {
			b = 'has-header bg bg-1';
		} else if (input === 2) {
			b = 'has-header bg bg-2';
		} else if (input === 3) {
			b = 'has-header bg bg-3';
		}

		return b;

	}
});

filters.filter("time_to", function ($moment) {
	return function (input) {

		var m = $moment().diff(input, 'hour');
		var t = ''

		if (m > 0) {
			if (m == 1) {
				t = m + ' ora fà';
			} else {
				t = m + ' ore fà';
			}
			
		} else if (m == 0) {
			t = 'adesso'
		} else {
			if (m == -1) {
				t = 'tra ' + -m + ' ora';
			} else {
				t = 'tra ' + -m + ' ore';	
			}
			
		}

		return t;
	};	
});

filters.filter("forecast_date", function ($moment) {

	return function (input) {
		var date;
		var h1;
		
		date = $moment(input);

		var h = date.hour();
		
		if (h < 10) {
			h1 = '0' + h;
		} else {
			h1 = h;
		};

		var d = h1 + ':00';

		// console.log(d);

		return d;

	};

});

filters.filter("wind", function () {
  return function (input) {

    var speed = '';
    
    speed = input.speed + ' m/s';

    var dir = _get_direction_wind(input);

    return dir + ' ' + speed;
 
  }
});

filters.filter("wind_img", function () {
  return function (input) {

    var img = '';
    
    var dir = _get_direction_wind(input);

    if (dir == 'N') {
    	img = 'img/weather/wind/n.png';
    } else if (dir == 'NE') {
    	img = 'img/weather/wind/ne.png';
    } else if (dir == 'E') {
    	img = 'img/weather/wind/e.png';
    } else if (dir == 'SE') {
    	img = 'img/weather/wind/se.png';
    } else if (dir == 'S') {
    	img = 'img/weather/wind/s.png';
    } else if (dir == 'SW') {
    	img = 'img/weather/wind/sw.png';
    } else if (dir == 'W') {
    	img = 'img/weather/wind/w.png';
    } else if (dir == 'NW') {
    	img = 'img/weather/wind/nw.png';
    };    

    // { "speed": 2.74, "deg": 159.001 }

    return img;
 
  }
});

filters.filter('weather_icon', function() {
	return function (input) {

		// console.log('icon: ' + input);

		var icon = 'icon icon-' + _get_icon_weather(input);

    	return icon;

	}
});

filters.filter('distance', function(Geolocation) {
	return function (input) {

		var d = Geolocation.distance(input.latitude, input.longitude) + ' Km';

		// var distance = Geolocation.distance(Number(input.lat), Number(input.lng));
		// console.log('location ok -> ' + d);

		return d;
		
	};
});

filters.filter('distance_poi', function(Geolocation) {
	return function (input) {

		var d = Geolocation.distance(input.lat, input.lon) + ' Km';

		// var distance = Geolocation.distance(Number(input.lat), Number(input.lng));
		//console.log('location ok -> ' + d);
					
		return d;
		
	};
});

filters.filter('poi_cat', function() {
	return function (input) {

		var d = 'img/markers/' + input

		return d
	}
});

filters.filter('weather_img', function() {
	
	return function (input) {
        
		var iw = _get_icon_weather(input);
		var icon = '';

		// console.log('icon: ' + icon);

		if (typeof iw !== 'undefined') {
        	icon = 'img/weather/100px/' + iw + '.png';
        };

        console.log('Filter: ' + JSON.stringify(input) + '->' + icon);

        return icon;
    };
});

function _get_direction_wind(input) {

	var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    var degree;
    var dir = '';

    if (typeof input !== 'undefined') {

	    if (parseFloat(input.deg) > 338) {
	      degree = 360 - parseFloat(input.deg);
	    } else {
	      degree = parseFloat(input.deg);
	    };

	    var index = Math.floor((degree + 22) / 45);
	    dir = directions[index];
	};

    return dir;

}

function _get_icon_weather(input) {

	var icon = '';

	if (typeof input !== 'undefined') {

		if (input == '01d') {
			icon = '023';
		} else if (input == '01n') {
			icon = '021';
		} else if (input == '02d') {
			icon = '001';
		} else if (input == '02n') {
			icon = '022';
		} else if (input == '03d' || input == '03n') {
			icon = '003';
		} else if (input == '04d' || input == '04n') {
			icon = '022';
		} else if (input == '09d' || input == '09n') {
			icon = '007';
		} else if (input == '010d') {
			icon = '018';
		} else if (input == '010n') {
			icon = '004';
		} else if (input == '011d' || input == '011n') {
			icon = '032';
		} else if (input == '013d' || input == '013n') {
			icon = '039';
		} else if (input == '050d' || input == '050n') {
			icon = '050';
		};
	};

	console.log('Input weather icon: ' + input + '->' + icon);

	return icon;

};

function _deg2rad(deg) {
    return deg * (Math.PI/180)
};

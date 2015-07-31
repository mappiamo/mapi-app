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
		console.log('location ok -> ' + d);
					
		return d;
		
	};
});

filters.filter('weather_img', function() {
	return function (input) {
        
        var icon = 'img/weather/' + _get_icon_weather(input) + '.png';

    	console.log('Filter: ' + JSON.stringify(input) + '->' + icon);

        return icon;
    };
});

function _get_direction_wind(input) {

	var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    var degree;

    if (parseFloat(input.deg) > 338) {
      degree = 360 - parseFloat(input.deg);
    } else {
      degree = parseFloat(input.deg);
    };

    var index = Math.floor((degree + 22) / 45);
    var dir = directions[index];

    return dir;

}

function _get_icon_weather(input) {

	var icon = '';

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

	return icon;

};

function _deg2rad(deg) {
    return deg * (Math.PI/180)
};

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

angular.module('gal.services', [])

.factory('Gal', function ($http, Weather, async, _, TEST, TestData, MAPPIAMO, Geolocation, MAPQUEST) {

  // Some fake testing data
  var gal_json = {

    // epoca
    epoca: [
      {
        name: 'Contemporanea'
      },
      {
        name: 'Medievale'
      },
      {
        name: 'Medievale/Moderna'
      },
      {
        name: 'Messapica'
      },
      {
        name: 'Messapico/Romana'
      },
      {
        name: 'Moderna'
      },
      {
        name: 'Pre-protostorica'
      },
      {
        name: 'Romana'
      },
      {
        name: 'Romano/Medievale'
      }
    ],

    // punti di interesse
    poi: [
      {
        name: 'Architettura Civile'
      },
      {
        name: 'Architettura Militare'
      },
      {
        name: 'Architettura Religiosa'
      },
      {
        name: 'Architettura Rurale'
      },
      {
        name: 'Archeologia'
      },
      {
        name: 'Archeologia Industriale'
      },
      {
        name: 'Paesaggio e Natura'
      },
      {
        name: 'Parco Naturale'
      },
      {
        name: 'Sito pluristartificato'
      }
    ],

    // itinerari
    itinerari:[
      {
        title: 'Paduli',
        _id: 154,
        poi: 1,
        name: 'Paduli',
        image: 'img/itinerari/paduli.jpg',
        description: 'Un percorso che si snoda lungo sei comuni del basso Salento, partendo da Nociglia, il comune più a nord, per toccare Montesano Salentino, Miggiano, Taurisano, Ruffano e Specchia.'
      },
      {
        title: 'Fede',
        _id: 153,
        poi: 1,
        name: 'Fede',
        image: 'img/itinerari/fede.jpg',
        description: 'Un affascinante percorso costellato di chiese rurali, cripte, luoghi di ristoro, attraversando una campagna ricca di quelle testimonianze rurali tipiche del territorio salentino.'
      },
      {
        title: 'Naturalistico/Archeologico',
        _id: 156,
        poi: 47,
        name: 'Naturalistico\/archeologico',
        image: 'img/itinerari/natura.jpg',
        description: 'Un percorso che attraversa i comuni di Ugento, Salve, Morciano di Leuca, Presicce ed Acquarica del Capo, fino a raggiungere il famoso Parco Naturale Litorale di Ugento.'
      },
      {
        title: 'Falesie',
        _id: 155,
        poi: 44,
        name: 'Falesie',
        image: 'img/itinerari/falesie.jpg',
        description: 'Un percorso che si dispiega lungo la costa adriatica del Capo di Leuca, un paesaggio spettacolare dove il mare e la terra quasi si scontrano lungo la linea di costa, alta, rocciosa, costellata di grotte e insenature.'
      }
    ],

    // comuni
    comuni: [{
        name: 'Acquarica del Capo',
        lat: 39.9100281,
        lng: 18.2455895
      },
      {
        name: 'Alessano',
        lat: 39.9027271,
        lng: 18.3328861
      },
      {
        name: 'Corsano',
        lat: 39.8888851,
        lng: 18.3674097
      },
      {
        name: 'Gagliano del Capo',
        lat: 39.8432082,
        lng: 18.3691496
      },
      {
        name: 'Miggiano',
        lat: 39.9612344,
        lng: 18.3119951
      },
      {
        name: 'Morciano di Leuca',
        lat: 39.8473057,
        lng: 18.3108947
      },
      {
        name: 'Nociglia',
        lat: 40.0380447,
        lng: 18.3287192
      },
      {
        name: 'Patù',
        lat: 39.8397876,
        lng: 18.3390086
      },
      {
        name: 'Presicce',
        lat: 39.9022785,
        lng: 18.26223
      },
      {
        name: 'Ruffano',
        lat: 39.9814862,
        lng: 18.2484557
      },
      {
        name: 'Salve',
        lat: 39.8609955,
        lng: 18.2948136
      },
      {
        name: 'Specchia',
        lat: 39.9403563,
        lng: 18.2980659
      },
      {
        name: 'Taurisano',
        lat: 39.9569847,
        lng: 18.2197121
      },
      {
        name: 'Tiggiano',
        lat: 39.9032624,
        lng: 18.3652988
      },
      {
        name: 'Tricase',
        lat: 39.9292797,
        lng: 18.3533423
      },
      {
        name: 'Ugento',
        lat: 39.9247461,
        lng: 18.1607648
      }],

      itinerario: function (id) {

        var it = _.find(gal_json.itinerari, function (item) {
          return item._id == id;
        });

        return it;

      },

      poi_nearest: function (degree, done) {
        
        var nearest_pois = [];

        var direction = _getDirection(degree);

        console.log('degree: ' + degree + ' direction: ' + direction);

        async.each(gal_json.itinerari, function (item, callback) {

          var n = {
            itinerario: item,
            item: null,
            onRoute: false,
            direction: 0,
            route: null
          };

          gal_json.poi(item._id, null, function (err, data) {

            // console.log('first element: ' + JSON.stringify(data));
            console.log('n element: ' + _.size(data));

            var p = _.sortBy(data, function (item) {
              return Geolocation.distance(item.lat, item.lon);
            });

            // console.log(JSON.stringify(p[0]));

            console.log('Coordinate POI: ' + p[0].lat + ',' + p[0].lon);

            n.item = p[0];

            // calcolo il percorso di routing
            var location = Geolocation.get(function (position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;
              var url = _getUrlRoute(lat, lng, p[0].lat, p[0].lon, MAPQUEST.key);

              var options = {
                method: 'GET',
                url: url,
                dataType: 'json'
              };

              $http.get(url)
                .success(function(data_route) {
                    //console.log(JSON.stringify(data_route.route.legs.maneuvers));
                    n.direction = data_route.route.legs[0].maneuvers[0].direction;
                    n.onRoute = (n.direction = data_route.route.legs[0].maneuvers[0].direction);
                    console.log('Same Route: ' + n.onRoute);
                    nearest_pois.push(n);
                    callback();
                })
                .error(function(data_route, status, headers, config) {
                    console.log('Unable to get itinerario ' + name);
                    callback(true);
                });
            }, function (err) {
              callback(true);
            });
          });

        }, function (err) {
          done(err, nearest_pois, direction);
        });

      },

      // punti di interesse
      poi: function (id, idpoi, callback) {
        
        var it = gal_json.itinerario(id);

        var url = MAPPIAMO.poi + it.poi + MAPPIAMO.jsonp;

        var options = {
          method: 'GET',
          url: url,
          dataType: 'jsonp',
        };

        $http(options)
            .success(function(data) {
                // console.log('success: ' + JSON.stringify(data[0]));
                // done(data.name, data.weather[0].description);
                
                var d;

                if (idpoi != null) {
                  console.log('filter poi by :' + idpoi);

                  d = _.filter(data, function (item) {
                    // console.log(JSON.stringify(item));
                    return item.id == idpoi;
                  });

                  console.log('trovato -> ' + JSON.stringify(d));
                
                } else {
                  d = data;
                  // console.log('trovati n.' + _.size(d) + ' poi per l\'itinerario ' + name);
                };

                callback(false, d);
            })
            .error(function(data, status, headers, config) {
                console.log('Unable to get itinerario ' + name);
                callback(true, null);
            });


      },

      // itinerari
      content: function (id, callback) {

        var it = gal_json.itinerario(id);

        var url = MAPPIAMO.content + it._id + MAPPIAMO.jsonp;

        console.log('getting data by ' + url);

        var options = {
          method: 'GET',
          url: url,
          dataType: 'jsonp'
        };

        $http(options)
          .success(function(data) {
              // console.log('success: ' + JSON.stringify(data));
              callback(false, data);
          })
          .error(function(data, status, headers, config) {
              console.log('Unable to get itinerario ' + name);
              callback(true, null);
        });
          
      },

      /**
       * @ngdoc function
       * @name core.Services.Gal#method2
       * @methodOf core.Services.Gal
       * @return {boolean} Returns a boolean value
       */
      weather: function(done) {
          
          var weather_json = [];

          console.log('weather start ...');
          
          async.each(this.comuni, function (item, callback) {
              // console.log('get forecast data by ' + item.name);
              Weather.forecast(item.lat, item.lng, function (err, data) {
                  
                  var w = {
                      item: item,
                      forecast: data,
                      location: {
                        latitude: item.lat,
                        longitude: item.lng
                      },
                      sizes: _.size(data)    
                  };
                  
                  weather_json.push(w); 
                  callback(err);   
              });
          }, function (err) {
              done(err, weather_json);
          });
      }
  };

  return gal_json;
});

function _getDirection (degree) {

  /*
  none = 0
  north = 1
  northwest = 2
  northeast = 3
  south = 4
  southeast= 5
  southwest = 6
  west = 7
  east = 8
  */

    var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    var d;

    if (parseFloat(degree) > 338) {
      d = 360 - parseFloat(degree);
    } else {
      d = parseFloat(degree);
    };

    var index = Math.floor((d + 22) / 45);
    var dir = directions[index];

    return index+1;

};

function _getUrlRoute(from_lat, from_lng, to_lat, to_lng, key) {

  var url = 'http://open.mapquestapi.com/directions/v2/route?key=' + key + '&destinationManeuverDisplay=true&outFormat=json&routeType=fastest&timeType=1&narrativeType=html&enhancedNarrative=false&shapeFormat=cmp&generalize=0&locale=it_IT&unit=k&from=' + from_lat + ',' + from_lng + '&to=' + to_lat + ',' + to_lng + '&drivingStyle=2&highwayEfficiency=21.0';
  console.log(url);
  return url;
}
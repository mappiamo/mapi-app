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

.factory('Gal', function ($http, Weather, async, _, TEST, MAPPIAMO, Geolocation, MAPQUEST, $utility, pdb, DB, $filters) {

  var db;

  // Some fake testing data
  var gal_json = {

    item: function () {
      
      var it = {
        _id: '',
        _rev: '',
        data: null,
        filtered: []
      };

      return it;
    },

    // itinerari
    routes:[
      {
        title: 'Paduli',
        _content: '539',
        _categories: '37',
        name: 'Paduli',
        image: 'img/itinerari/paduli.jpg',
        description: 'Un percorso che si snoda lungo sei comuni del basso Salento, partendo da Nociglia, il comune più a nord, per toccare Montesano Salentino, Miggiano, Taurisano, Ruffano e Specchia.'
      },
      {
        title: 'Fede',
        _content: '538',
        _categories: '11',
        name: 'Fede',
        image: 'img/itinerari/fede.jpg',
        description: 'Un affascinante percorso costellato di chiese rurali, cripte, luoghi di ristoro, attraversando una campagna ricca di quelle testimonianze rurali tipiche del territorio salentino.'
      },
      {
        title: 'Naturalistico/Archeologico',
        _content: '541',
        _categories: '57',
        name: 'Naturalistico\/archeologico',
        image: 'img/itinerari/natura.jpg',
        description: 'Un percorso che attraversa i comuni di Ugento, Salve, Morciano di Leuca, Presicce ed Acquarica del Capo, fino a raggiungere il famoso Parco Naturale Litorale di Ugento.'
      },
      {
        title: 'Falesie',
        _content: '540',
        _categories: '54',
        name: 'Falesie',
        image: 'img/itinerari/falesie.jpg',
        description: 'Un percorso che si dispiega lungo la costa adriatica del Capo di Leuca, un paesaggio spettacolare dove il mare e la terra quasi si scontrano lungo la linea di costa, alta, rocciosa, costellata di grotte e insenature.'
      }
    ],

    getRoute: function (id) {

      var it = _.find(gal_json.routes, function (item) {
        return item._content == id;
      });

      return it;

    },

    pois: [],

    // punti di interesse ordinate per coordinate più vicine
    poi_latlng: function (done) {
      
      var pois = [];

      var self = this;
  
      async.each(self.routes, function (item, callback) {
        console.log('getting pois by ' + item._content);
        self.poi(item._content, null, function (err, data) {
          self._poi_latlng(data, item._content, function (err) {
            callback();
          });
        });

      }, function (err) {
        console.log('*** total pois: ' + _.size(self.pois));
        done(err, self.pois);
      });

    },

    // punti di interesse ordinate per coordinate più vicine
    _poi_latlng: function (data, content, done) {

      var self = this;

      async.each(data, function (item, callback) {

        // console.log('-------------------');
        // console.log(JSON.stringify(item));

        var poiData = {
            id: item.id,
            content: content,
            category: item.id,
            longitude: item.lon,
            latitude: item.lat,
            altitude: 0,
            description: item.address,
            title: item.title
        };

        self.pois.push(poiData);

        callback();

      }, function (err) {
        done(err)
      });

    },

    // leggo il punto di interesse più vicino in una direzione
    poi_nearest: function (direction, done) {
      
      var nearest_pois = [];
      var self = this;

      async.each(self.routes, function (item, callback) {

        var n = {
          content: item,
          item: null,
          onRoute: false,
          direction: 0,
          route: null
        };

        gal_json.poi(item._categories, null, function (err, data) {

          var dt = data.data;

          // console.log('first element: ' + JSON.stringify(dt));
          console.log('n element: ' + _.size(dt));

          var p = _.sortBy(dt, function (item) {
            // console.log('distance by : ' + item.lat + ',' + item.lon);
            return Geolocation.distance(item.lat, item.lon);
          });

          // console.log('sorted: ' + JSON.stringify(p));

          if (_.size(p) > 0) {

            // console.log('Coordinate POI: ' + p[0].lat + ',' + p[0].lon);

            n.item = p[0];

            // calcolo il percorso di routing
            var location = Geolocation.get(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            var url = $utility._getUrlRoute(lat, lng, p[0].lat, p[0].lon, MAPQUEST.key);

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
          } else {
            console.log('non ho trovato POI.');
            callback();
          }
        });

      }, function (err) {
        done(err, nearest_pois, direction);
      });

    },

    // punti di interesse
    poi: function (category, idpoi, callback, byUrl) {

      var self = this;

      if (byUrl) {
        console.log('getting data POI by url')
        self._poi_URI(category, idpoi, callback);
      } else {
        pdb.open(DB.name, function (db_callback) {
            db = db_callback;
            
            pdb.get(db, category + '_pois', function (err, data) {
              if (!err) {
                console.log('getting data POI by Database ');
                console.log('pois n.' + _.size(data));
                //console.log('pois : ' + JSON.stringify(data));
                
                self._send_pois(idpoi, data, function (err, response) {
                  callback(err, response);
                });
                
              } else {
                console.log('getting data POI by url')
                self._poi_URI(category, idpoi, callback);
              };
            });
        });
      };
    },

    _send_pois: function (idpoi, data, done) {
      
      var self = this; 

      if (idpoi != null) {
        console.log('filter poi by :' + idpoi);

        var d = _.filter(data.data, function (item) {
          return item.id == idpoi;
        });

        // console.log('trovato -> ' + JSON.stringify(d));
        done(false, d);
      } else {
        console.log('trovati n.' + _.size(data) + ' poi per l\'itinerario ' + name);
        self._setFilters(data, function (err, data) {
          console.log('data filtered Ok.')
          done(err, data);
        });
      };

    },

    // punti di interesse da url
    _poi_URI: function (id, idpoi, callback) {
      
      var self = this;
      
      var url = MAPPIAMO.poi + id + MAPPIAMO.jsonp;

      var options = {
        method: 'GET',
        url: url,
        dataType: 'jsonp',
      };

      console.log('getting data by: ' + url);

      var dt = self.item();
      dt._id = id + '_pois';

      $http(options)
          .success(function(data) {
              
              // var d;

              self._send_pois(idpoi, data, function (err, response) {
                self.decodeHTML(response.data, function (err) {
                  self.setFilters(response, function (err, data) {
                    console.log('data filtered Ok.')
                    callback(err, data);
                  });
                });
                
              });

              /*
              if (idpoi != null) {
                console.log('filter poi by :' + idpoi);

                d = _.filter(data, function (item) {
                  return item.id == idpoi;
                });

                console.log('trovato -> ' + JSON.stringify(d));
              
              } else {
                d = data;
                console.log('trovati n.' + _.size(d) + ' poi per l\'itinerario ' + name);
              };

              dt.data = d;
              */
              
              
          })
          .error(function(data, status, headers, config) {
              console.log('Unable to get itinerario ' + name);
              callback(true, null);
          });
    },

    _setFilters: function (data, done) {

      var filters;

      var self = this;

      async.series([
        function (callback) {
          $filters.get(function (err, f) {
            console.log('Filters on StartUp: ----------------')
            console.log(JSON.stringify(f));
            filters = f;
            callback();
          });
        },

        function (callback) {

          console.log('start filter ...')
          data.filtered = [];

          async.each(data.data, function (item, callback_child) {

            if (item.type == 'route') {
              data.filtered.push(item);
            } else if ($filters.isFilter(item, filters)) {
              data.filtered.push(item);
            };

            callback_child();
            
          }, function (err) {
            callback();
          });

        }
      ], function (err, result) {
        console.log('object filtered n.' + _.size(data.filtered));
        done(err, data);
      });

    },

    decodeHTML: function (data, done) {
      
      async.each(data, function (item, callback) {
        item.text = S(S(item.text).stripTags().s).decodeHTMLEntities().s;
        callback();
      }, function (err) {
        done(err);
      });

    },

    // itinerari
    content: function (id, callback, byUrl) {

      var self = this;

      if (byUrl) {
        console.log('getting data by url')
        self._content_URI(id, callback);
      } else {
        pdb.open(DB.name, function (db_callback) {
            db = db_callback;
            pdb.get(db, id, function (err, data) {
              if (!err) {
                console.log('getting data by Database ');
                callback(err, data);
              } else {
                console.log('getting data by url')
                self._content_URI(id, callback);
              }
            });
        });
      };
    },

    _content_URI: function (id, callback) {

      var url = MAPPIAMO.content + id + MAPPIAMO.jsonp;
      var self = this; 

      console.log('getting data by ' + url);

      var options = {
        method: 'GET',
        url: url,
        dataType: 'jsonp'
      };

      var dt = self.item();

      $http(options)
        .success(function(data) {
          dt._id = id;
          dt.data = data;
          callback(false, dt, 0);
        })
        .error(function(data, status, headers, config) {
            console.log('Unable to get itinerario ' + name);
            callback(true, null, 0);
      });
    }

    /*
    ,

    // condizioni meteo      
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
    */
  };

  return gal_json;

});
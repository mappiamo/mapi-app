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

.factory('Gal', function ($http, Weather, async, _, TEST, MAPPIAMO, Geolocation, MAPQUEST, $utility, pdb, DB, $filters, $language) {

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

    events: [],

    // itinerari
    routes:[
      {
        title: 'Paduli',
        _content: '665',
        _categories: '37',
        lang: {
          en: {
            _title: 'Paduli',
            _content: '732',
            _categories: '37',
            _parent_id: 'aed54dec-1810-11e5-8c6e-23016835f201'
          },
          it: {
            _title: 'Paduli',
            _content: '728',
            _categories: '37',
            _parent_id: ''
          }
        },
        name: 'Paduli',
        color: '#00CCCC',
        image: 'img/itinerari/paduli.jpg',
        description: 'Un percorso che si snoda lungo sei comuni del basso Salento, partendo da Nociglia, il comune più a nord, per toccare Montesano Salentino, Miggiano, Taurisano, Ruffano e Specchia.'
      },
      {
        title: 'Fede',
        _content: '538',
        _categories: '11',
        lang: {
          en: {
            _title: 'Fede',
            _content: '727',
            _categories: '11'
          },
          it: {
            _title: 'Fede',
            _content: '727',
            _categories: '11'
          }
        },
        color: '#FF00FF',
        name: 'Fede',
        image: 'img/itinerari/fede.jpg',
        description: 'Un affascinante percorso costellato di chiese rurali, cripte, luoghi di ristoro, attraversando una campagna ricca di quelle testimonianze rurali tipiche del territorio salentino.'
      },
      {
        title: 'Naturalistico/Archeologico',
        _content: '541',
        _categories: '57',
        lang: {
          en: {
            _title: 'Naturalistic/Archaeological',
            _content: '734',
            _categories: '110',
            _parent_id: 'e8d52c16-1a8f-11e5-aa12-3b34e0c41583'
          },
          it: {
            _title: 'Naturalistico/Archeologico',
            _content: '730',
            _categories: '58'
          }
        },
        color: '#68B42E',
        name: 'Naturalistico\/archeologico',
        image: 'img/itinerari/natura.jpg',
        description: 'Un percorso che attraversa i comuni di Ugento, Salve, Morciano di Leuca, Presicce ed Acquarica del Capo, fino a raggiungere il famoso Parco Naturale Litorale di Ugento.'
      },
      {
        title: 'Falesie',
        _content: '729',
        _categories: '56',
        lang: {
          en: {
            _title: 'Falesie',
            _content: '729',
            _categories: '56'
          },
          it: {
            _title: 'Falesie',
            _content: '729',
            _categories: '56'
          }
        },
        color: '#CC9999',
        name: 'Falesie',
        image: 'img/itinerari/falesie.jpg',
        description: 'Un percorso che si dispiega lungo la costa adriatica del Capo di Leuca, un paesaggio spettacolare dove il mare e la terra quasi si scontrano lungo la linea di costa, alta, rocciosa, costellata di grotte e insenature.'
      }
    ],

    getColorContent: function (id) {

      var color = '#000000';
      var self = this;
      console.log('get color');
      self.getRoutes(function (err, routes) {
        var c = _.find(routes, function (item) {
          return item._content == id;
        }); 

        if (typeof c !== 'undefined') {
          color = c.color;
        };

        console.log('found color ' + color);

        return color;
      });

    },

    getRoutes: function (done) {

      var self = this;

      $language.get(function (err, result) {

        console.log('language: ' + result);
            
        async.each(self.routes, function (item, callback) {
          if (result == 'it') {
            item.title = item.lang.it._title;
            item._content = item.lang.it._content;
            item._categories = item.lang.it._categories;
          } else if (result == 'en') {
            item.title = item.lang.en._title;
            item._content = item.lang.en._content;
            item._categories = item.lang.en._categories;
          };
          callback();
        }, function (err) {
          // console.log('Routes: ' + JSON.stringify(self.routes));
          done(err, self.routes);
        })

      });

    },

    getRouteByName: function (name, done) {

      var self = this;

      var it = _.find(self.routes, function (item) {
        // console.log('route item: ' + JSON.stringify(item));
          return item.name == name;
      });

        // console.log('found route item: ' + JSON.stringify(it));

        done(false, it);

    },

    getRoute: function (id, done) {

      var self = this;

      $language.get(function (err, result) {
        
        console.log('get route by language: ' + result + ' and id ' + id);

        var it = _.find(self.routes, function (item) {
          // console.log('route item: ' + JSON.stringify(item));
          if (result == 'it') {
            return item.lang.it._content == id;
          } else if (result == 'en') {
            return item.lang.en._content == id;
          }
          
        });

        // console.log('found route item: ' + JSON.stringify(it));

        done(err, it);

      });
    },

    poiAll: function (done) {

      var self = this;
      var pois = [];

      var options = {
        all: true,  // tutti i POI
        category: null, 
        content: null, 
        poi: null, 
        filters: null,
        nearest: true,
        limit: 10,
        lat: 0,
        lng: 0
      };

      this.getRoutes(function (err, routes) {
          
          async.each(routes, function (item, callback) {
            
            var options = {
              content: item._content,
              category: item._categories,
              idpoi: null,
              byUrl: false
            };

            console.log(JSON.stringify(options));

            self.poi(function (err, data) {

              console.log('loading pois n.' + _.size(data.data));
              //console.log('first element --> ' + JSON.stringify(data))
              var data_filtered = _.filter(data.data, function (item) {
                return item.type != 'route';
              });

              pois = _.union(data_filtered, pois);
              console.log('Now pois n.' + _.size(pois));
              callback();

            }, options);
            
          }, function (err) {
            if (typeof done === 'function') {
              console.log(JSON.stringify(pois[0]));
              console.log('Elements n.' + _.size(pois));
              done(err, pois);
            }
          });

        });

    },

    poiAPI: function (callback, options) {
      var self = this;

      var options_http = {
        method: 'GET',
        url: MAPPIAMO.api,
        dataType: 'jsonp',
      };

      console.log('getting data by: ' + options.url);

      $http(options_http)
          .success(function(data) {
              
              var poi = _.find(data, function (item) {
                return item.id == options.idpoi;
              }); 

              callback(false, poi);

          })
          .error(function(data, status, headers, config) {
              console.log('Unable to get pois api ' + url);
              callback(true, null);
          });

    },

    // punti di interesse
    poi: function (callback, options) {

      var self = this;

      if (options.byUrl) {
        console.log('getting data POI by url')
        self._poi_URI(options.category, options.idpoi, callback);
      } else {
        pdb.open(DB.name, function (db_callback) {
            db = db_callback;
            
            pdb.get(db, options.category + '_pois', function (err, data) {
              if (!err) {
                console.log('getting data POI by Database ');
                console.log('pois n.' + _.size(data));
                //console.log('pois : ' + JSON.stringify(data));
                
                self._send_pois(options.idpoi, data, function (err, response) {
                  callback(err, response);
                });
                
              } else {
                console.log('getting data POI by url')
                self._poi_URI(options.category, options.idpoi, callback);
              };
            });
        });
      };
    },

    _send_pois: function (idpoi, data, done) {
      
      var self = this; 

      if (idpoi != null) {

        console.log('search POI :' + idpoi);

        var d = _.filter(data.data, function (item) {
          return item.id == idpoi;
        });

        console.log('trovato -> ' + JSON.stringify(d));
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

              dt.data = data;

              self._send_pois(idpoi, dt, function (err, response) {
                self.decodeHTML(response, function (err, response2) {

                    self._setFilters(response2, function (err, response3) {
                      console.log('data filtered Ok.')
                      callback(err, response3);
                    });
                  

                });
              });
              
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
            // console.log('Filters on StartUp: ----------------')
            // console.log(JSON.stringify(f));
            filters = f;
            callback();
          });
        },

        function (callback) {

          // console.log('start filter ...')
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
      
      async.each(data.data, function (item, callback) {
        item.text = S(S(item.text).stripTags().s).decodeHTMLEntities().s;
        callback();
      }, function (err) {
        done(err, data);
      });

    },

    // itinerari
    content: function (callback, options) {

      var self = this;

      if (options.byUrl) {
        console.log('getting data by url')
        self._content_URI(options.content, callback);
      } else {
        pdb.open(DB.name, function (db_callback) {
            db = db_callback;
            pdb.get(db, options.content, function (err, data) {
              if (!err) {
                console.log('getting data by Database ');
                callback(err, data);
              } else {
                console.log('getting data by url')
                self._content_URI(options.content, callback);
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
          console.log(JSON.stringify(dt));
          callback(false, dt);
        })
        .error(function(data, status, headers, config) {
            console.log('Unable to get itinerario ' + name);
            callback(true, null);
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
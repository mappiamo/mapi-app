var Gal = {

    item: function () {
      
      var it = {
        _content: '',
        _category: '',
        name: '',
        data: {},
        _rev: '',
        media: []  
      };

      return it;
    },

    get_poiData: function () {

      var p = {
        _id: '',
        _rev: '',
        data: null
      }

      return p;
    },

    // epoca
    ages: [
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

    // cateorie punti di interesse
    categories: [
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

    db: null,

    // itinerari
    routes:[
      {
        title: 'Paduli',
        _content: 539,
        _categories: 37,
        name: 'Paduli',
        image: 'img/itinerari/thumbs/paduli.jpg',
        description: 'Un percorso che si snoda lungo sei comuni del basso Salento, partendo da Nociglia, il comune più a nord, per toccare Montesano Salentino, Miggiano, Taurisano, Ruffano e Specchia.'
      },
      {
        title: 'Fede',
        _content: 538,
        _categories: 11,
        name: 'Fede',
        image: 'img/itinerari/thumbs/fede.jpg',
        description: 'Un affascinante percorso costellato di chiese rurali, cripte, luoghi di ristoro, attraversando una campagna ricca di quelle testimonianze rurali tipiche del territorio salentino.'
      },
      {
        title: 'Naturalistico/Archeologico',
        _content: 541,
        _categories: 57,
        name: 'Naturalistico\/archeologico',
        image: 'img/itinerari/thumbs/natura.jpg',
        description: 'Un percorso che attraversa i comuni di Ugento, Salve, Morciano di Leuca, Presicce ed Acquarica del Capo, fino a raggiungere il famoso Parco Naturale Litorale di Ugento.'
      },
      {
        title: 'Falesie',
        _content: 540,
        _categories: 54,
        name: 'Falesie',
        image: 'img/itinerari/thumbs/falesie.jpg',
        description: 'Un percorso che si dispiega lungo la costa adriatica del Capo di Leuca, un paesaggio spettacolare dove il mare e la terra quasi si scontrano lungo la linea di costa, alta, rocciosa, costellata di grotte e insenature.'
      }
    ],

    // comuni del GAL
    cities: [{
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

      getRoute: function (id) {

        var self = this;

        var it = _.find(self.routes, function (item) {
          return item._content == id;
        });

        return it;

      },

      pois: [],

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

      poiData: null,

      // leggo il punto di interesse più vicino in una direzione
      poi_nearest: function (direction, done) {
        
        var nearest_pois = [];
        var self = this;

        async.each(self.routes, function (item, callback) {

          var n = {
            itinerario: item,
            item: null,
            onRoute: false,
            direction: 0,
            route: null
          };

          self.poi(item._content, null, function (err, data) {

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
            var url = $utility._getUrlRoute(lat, lng, p[0].lat, p[0].lon, MAPQUEST.key);

            var options = {
              method: 'GET',
              url: url,
              dataType: 'json'
            };

            _get(url, function (err, data) {
              if (!err) {
                  //console.log(JSON.stringify(data_route.route.legs.maneuvers));
                  n.direction = data_route.route.legs[0].maneuvers[0].direction;
                  n.onRoute = (n.direction = data_route.route.legs[0].maneuvers[0].direction);
                  console.log('Same Route: ' + n.onRoute);
                  nearest_pois.push(n);
                  callback();
                } else {
                  console.log('Unable to get itinerario ' + name);
                  callback(true);
                }
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
        
        var it = this.getRoute(id);

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

        var url = Config.data.MAPPIAMO.poi + it._categories + Config.data.MAPPIAMO.jsonp;

        var options = {
          method: 'GET',
          url: url,
          dataType: 'jsonp',
        };

        console.log('getting data by: ' + url);

        _get(url, function (err, data) {

          if (!err) {
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
            } else {
              console.log('Unable to get itinerario ' + name);
                callback(true, null);
            }

          });
            
      },

      // itinerari
      content: function (id, callback) {

        var self = this;

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

        pdb.open(Config.data.DB.name, function (db_callback) {
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
      },

      loadData: function (done) {
        var self = this;

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

        pdb.open(Config.data.DB.name, function (db_callback) {
            self.db = db_callback;
            pdb.get(self.db, 'poiData', function (err, doc) {
              if (!err) {
                done(err, doc.data);
              } else {
                Gal.poi_latlng(function (err, data) {
                  self.saveData(data, function (err) {
                    console.log('saved data poiData');
                  });
                  done(err, data);
                });
              }
            })
        });
      },

      saveData: function (data, done) {
        var self = this;

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

        pdb.open(Config.data.DB.name, function (db_callback) {
            self.db = db_callback;
            
            var p = self.get_poiData();

            p._id = 'poiData';
            p.data = data;

            pdb.put(self.db, p, function (err, result) {
              console.log(JSON.stringify(result));
              done(err);
            })
        });

      },

      _content_URI: function (id, callback) {

        var url = Config.data.MAPPIAMO.content + id + Config.data.MAPPIAMO.jsonp;
        var self = this; 

        console.log('getting data by ' + url);

        var options = {
          method: 'GET',
          url: url,
          dataType: 'jsonp'
        };

        var d = self.item();

        _get(url, function (err, data) {
          if (!err) {
            d._content = id;
            d.data = data;
              // console.log('success: ' + JSON.stringify(data));
            callback(false, d, 0);
          } else {
            console.log('Unable to get itinerario ' + name);
            callback(true, null, 0);
          }
        });

      }
  };

  function _get(url, done) {
      
      var jqxhr = $.getJSON( url, function(data) {
        console.log( "success" );
        done(false,data);
      })
        .done(function() {
          console.log( "second success" );
        })
        .fail(function() {
          console.log( "error" );
          done(true,null);
        })
        .always(function() {
          console.log( "complete" );
        });

  } 
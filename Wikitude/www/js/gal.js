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

    options: {
      geojson: false,
      reset: true,
      nearest: false,
      latitude: 0,
      longitude: 0,
      geolocation: true
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

      getpoisData: function (item, content, lat, lng) {

        // console.log(JSON.stringify(item));

        var poiData = {
            id: item.id,
            content: content,
            category: item.id,
            longitudeReal: parseFloat(item.lon),
            latitudeReal: parseFloat(item.lat),
            altitude: 0,
            description: item.address,
            title: item.title,
            longitude: parseFloat(lng + (Math.random() / 5 - 0.1)),
            latitude: parseFloat(lat + (Math.random() / 5 - 0.1))
        };

        return poiData;

      },

      poi_latlng: function (done, options) {
        
        var pois = [];

        var self = this;
    
        async.each(self.routes, function (item, callback) {
          console.log('getting pois by ' + item._content);
          self.poi(item._content, null, function (err, data) {
            if (options.geojson) {
              self._poi_latlng_geojson(data, item._content, function (err) {
                callback();
              }, options);
            } else {
              self._poi_latlng(data, item._content, function (err) {
                callback();
              }, options);
            };
          });

        }, function (err) {
          console.log('*** total pois: ' + _.size(self.pois));
          if (options.geojson) {
            console.log('geojson data');
            console.log(JSON.stringify(self.poiGEOJSON));
            done(err, self.poiGEOJSON);
          } else {
            console.log('data');
            done(err, self.pois);
          };
        });

      },

      _poi_latlng_geojson: function(data, content, done, options) {

        var self = this;

        async.each(data, function (item, callback) {

          // console.log('-------------------');
          // console.log(JSON.stringify(item));

          var p = self.getpoisData(item, content, options.latitude, options.longitude);

          var feature = { 
            type: 'Feature',
            geometry: {
              type: 'Point', 
              coordinates: [item.lon, item.lat]
            },
            properties: p
          };

          self.poiGEOJSON.features.push(feature);

          callback();

        }, function (err) {
          done(err)
        });

      },

      _poi_latlng: function (data, content, done, options) {

        var self = this;

        async.each(data, function (item, callback) {

          // console.log('-------------------');
          // console.log(JSON.stringify(item));

          var p = self.getpoisData(item, content, options.latitude, options.longitude);

          self.pois.push(p);

          callback();

        }, function (err) {
          done(err)
        });

      },

      poiData: null,
      poiGEOJSON: { 
        type: 'FeatureCollection',
        features: []
      },

      // leggo il punto di interesse più vicino in una direzione
      poi_nearest: function (done, options) {
        
        var self = this;

        var point = {
          "type": "Feature",
          "properties": {
            "marker-color": "#0f0",
            "latitude": options.latitude,
            "longitude": options.longitude,
            "altitude": options.altitude
          },
          "geometry": {
            "type": "Point",
            "coordinates": [options.longitude, options.latitude]
          }
        };

        this.loadData(function (err, against) {
          if (!err) {
            var nearest = turf.nearest(point, against);
            done (err, nearest);
          };
        }, options);

      },

      poi_random: function (options) {

        var poisToCreate = 20;
        var poiData = [];

        for (var i = 0; i < poisToCreate; i++) {
          poiData.push({
            "id": (i + 1),
            "longitude": (options.longitude + (Math.random() / 5 - 0.1)),
            "latitude": (options.latitude + (Math.random() / 5 - 0.1)),
            "description": ("This is the description of POI#" + (i + 1)),
            // use this value to ignore altitude information in general - marker will always be on user-level
            "altitude": AR.CONST.UNKNOWN_ALTITUDE,
            "name": ("POI#" + (i + 1))
          });
        };

        return poiData;

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

      getDocName: function (geojson) {
        var docname = '';

        if (geojson && typeof geojson !== 'undefined') {
          docname = 'poiGEOJSON';
        } else {
          docname = 'poiData';
        };

        return docname;
      },

      _loadData: function(db, docname, done, options) {

        var self = this; 

        pdb.get(db, docname, function (err, doc) {
          if (!err) {
            console.log('getting data by db');
            done(err, doc.data);
          } else {
            console.log('getting data by url');
            Gal.poi_latlng(function (err, data) {
              self.saveData(data, function (err) {
                console.log('saved data poiData');
              }, options);
              done(err, data);
            }, options);
          }
        })

      },

      loadData: function (done, options) {
        
        var self = this;
        var docname = this.getDocName(options.geojson);

        Config.load(function (err, config) {
          console.log('loading configuration...')
          console.log(JSON.stringify(config));
        });

        pdb.open(Config.data.DB.name, function (db_callback) {
          
          self.db = db_callback;

          if (options.reset) {
            console.log('reset ' + docname);
            pdb.delete(self.db, docname, function (err, response) {
              self._loadData(self.db, docname, done, options);
            }); 
          } else {
            self._loadData(self.db, docname, done, options);
          };

        });
      },

      saveData: function (data, done, options) {
        var self = this;
        var docname = this.getDocName(options.geojson);

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

        pdb.open(Config.data.DB.name, function (db_callback) {
            self.db = db_callback;
            
            var p = self.get_poiData();

            p._id = docname;
            p.data = data;

            pdb.put(self.db, p, function (err, result) {
              console.log(JSON.stringify(result));
              done(err);
            })
        });

      },

      _content_URI: function (id, callback) {

        Config.load(function (err, config) {
          console.log(JSON.stringify(config));
        });

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
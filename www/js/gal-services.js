angular.module('gal.services', [])

.factory('Gal', function ($http, Weather, async, _, TEST) {

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
        name: 'Paduli',
        image: 'img/itinerari/paduli.jpg',
        description: 'L’itinerario Paduli è un percorso che si snoda lungo sei comuni del basso Salento, partendo da Nociglia, il comune più a nord, per toccare Montesano Salentino, Miggiano, Taurisano, Ruffano e Specchia.',
        api: 'http://test.mappiamo.org/travotest/index.php?module=api&task=content&object=154'
      },
      {
        name: 'Fede',
        image: 'img/itinerari/fede.jpg',
        description: 'L\'Itinerario della Fede porta il visitatore a scoprire il territorio del Capo di Leuca seguendo un affascinante percorso costellato di chiese rurali, cripte, luoghi di ristoro, attraversando una campagna ricca di quelle testimonianze rurali tipiche del territorio salentino: muretti a secco, uliveti terrazzati, pajare e costruzioni in pietre a secco che testimoniano lo sforzo della popolazione locale a rendere coltivabile quest\'area.',
        api: 'http://test.mappiamo.org/travotest/index.php?module=api&task=content&object=156'
      },
      {
        name: 'Naturalistico/Archeologico',
        image: 'img/itinerari/paduli.jpg',
        description: 'L\'itinerario Naturalistico-Archeologico è un percorso che attraversa i comuni di Ugento, Salve, Morciano di Leuca, Presicce ed Acquarica del Capo. L\'itinerario tocca numerose tipologie di monumenti, dai beni archeologici a quelli architettonici, dalle chiese rurali alle masserie e a i monumenti di pietra del Salento, fino a raggiungere il famoso Parco Naturale Litorale di Ugento caratterizzato da cordoni dunali, aree paludose e bacini collegati tra loro tramite canali collettori e con il mare attraverso tre foci.',
        api: 'http://test.mappiamo.org/travotest/index.php?module=api&task=content&object=155'
      },
      {
        name: 'Falesie',
        image: 'img/itinerari/falesie.jpg',
        description: 'L\'itinerario delle Falesie si dispiega lungo la costa adriatica del Capo di Leuca, un paesaggio spettacolare dove il mare e la terra quasi si scontrano lungo la linea di costa, alta, rocciosa, costellata di grotte e insenature',
        api: 'http://test.mappiamo.org/travotest/index.php?module=api&task=content&object=154'
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

      route: function (name, callback) {
        
        if (TEST.value) {
          callback(false, TEST.url);
        } else {

          var url = 'http://travocial.com/index.php?module=api&task=category&object=5&callback=JSON_CALLBACK';
          
          console.log('getting data by ' + url);

          var options = {
            method: 'GET',
            url: url,
            dataType: 'jsonp',
          };

          $http(options)
            .success(function(data) {
                console.log('success: ' + data);
                // done(data.name, data.weather[0].description);
                var d = _.filter(gal_json.itinerari, function (item) {
                  return item.meta.name == 'tipo_itine' && 
                         item.meta.value == name;
                });
                console.log('trovati n.' + _.size(d) + ' poi per l\'itinerario ' + name);
                callback(false, d);
            })
            .error(function(data, status, headers, config) {
                console.log('Unable to get itinerario ' + name);
                callback(true, null);
            });
          };
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
              console.log('get forecast data by ' + item.name);
              Weather.forecast(item.lat, item.lng, function (err, data) {
                  
                  var w = {
                      item: item,
                      forecast: data,
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

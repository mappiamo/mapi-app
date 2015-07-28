angular.module('gal.services', [])

.factory('Gal', function ($http, Weather, async, _) {

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
        image: 'img/itinerari/paduli.jpg'
      },
      {
        name: 'Fede',
        image: 'img/itinerari/fede.jpg'
      },
      {
        name: 'Naturalistico/Archeologico',
        image: 'img/itinerari/paduli.jpg'
      },
      {
        name: 'Falesie',
        image: 'img/itinerari/falesie.jpg'
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
              Weather.forecast(item.lat, item.lng, function (data) {
                  
                  var w = {
                      item: item,
                      forecast: data,
                      sizes: _.size(data)    
                  };
                  
                  weather_json.push(w); 
                  callback();   
              });
          }, function (err) {
              done(err, weather_json);
          });
      }
  };

  return gal_json;
});

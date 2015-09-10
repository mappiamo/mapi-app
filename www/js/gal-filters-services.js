angular.module('gal.filters.services', [])

.factory('$filters', function ($http, async, _, MAPPIAMO, pdb, DB, S) {

  var filters_json = {

      _id: 'filters',

      isFilter: function (poi, filters) {

        var meta = poi.meta;
        var ret = false;

        // console.log('--------------------------------------');
        // console.log('Item: ' + JSON.stringify(meta));
        
        // categorie
        var cat_item = _.find(meta, function (item) {
          return item.name == 'categoria'
        });
        
        if (typeof cat_item !== 'undefined') { 
          var cat = _.find(filters.categories, function(item){ 
            return (item.name == cat_item.value) && item.value;
          });
          // console.log('Filtro Categoria: ' + JSON.stringify(cat) + '-' + cat_item.value);
          ret = ret || (typeof JSON.stringify(cat) !== 'undefined');
        };

        // epoca
        var age_item = _.find(meta, function (item) {
          return item.name == 'epoca'
        });
        if (typeof age_item !== 'undefined') {        
          var age = _.find(filters.ages, function(item){ 
            return (item.name == age_item.value) && item.value;
          });
          // console.log('Filtro Epoca: ' + JSON.stringify(age) + '-' + age_item.value);
          ret = ret || (typeof JSON.stringify(age) !== 'undefined');
        };

        // comuni
        /*
        var city_item = _.find(meta, function (item) {
          return item.name == 'ente_gestore'
        });
        if (typeof city_item !== 'undefined') { 
          var city = _.find(filters.cities, function(item){ 
            return S(city_item.value).include(item.name) && item.value;
          });
          console.log('Filtro Comune: ' + JSON.stringify(city) + '-' + city_item.value);
          ret = ret || (typeof JSON.stringify(city) !== 'undefined');
        };
        */

        // console.log('Ok Filter: ' + ret);

        return ret;

      },

      get: function (done) {
        
        var self = this;

        var ret;

        pdb.open(DB.name, function (db) {
            pdb.get(db, self._id, function (err, data) {
              if (err) {
                var f = {
                  _id: self._id,
                  _rev: '',
                  ages: self.ages,
                  categories: self.categories,
                  cities: self.cities
                };
                ret = f;
              } else {
                ret = data;
              };

              done (err, ret);
            });
        });
      },

      save: function (filters, done) {

        var self = this;

        pdb.open(DB.name, function (db) {
          
          pdb.put(db, filters, function (err, data) {
            done(err, data);
          });

        }); 

      },

      // epoca
      ages: [
        {
          name: 'Contemporanea',
          value: true
        },
        {
          name: 'Medievale',
          value: true
        },
        {
          name: 'Medievale/Moderna',
          value: true
        },
        {
          name: 'Messapica',
          value: true
        },
        {
          name: 'Messapico/Romana',
          value: true
        },
        {
          name: 'Moderna',
          value: true
        },
        {
          name: 'Pre-protostorica',
          value: true
        },
        {
          name: 'Romana',
          value: true
        },
        {
          name: 'Romano/Medievale',
          value: true
        }
      ],

      // cateorie punti di interesse
      categories: [
        {
          name: 'Architettura Civile',
          value: true
        },
        {
          name: 'Architettura Militare',
          value: true
        },
        {
          name: 'Architettura Religiosa',
          value: true
        },
        {
          name: 'Architettura Rurale',
          value: true
        },
        {
          name: 'Archeologia',
          value: true
        },
        {
          name: 'Archeologia Industriale',
          value: true
        },
        {
          name: 'Paesaggio e Natura',
          value: true
        },
        {
          name: 'Parco Naturale',
          value: true
        },
        {
          name: 'Sito pluristartificato',
          value: true
        }
      ],

      // comuni del GAL
      cities: [{
        name: 'Acquarica del Capo',
        lat: 39.9100281,
        lng: 18.2455895,
        value: true
      },
      {
        name: 'Alessano',
        lat: 39.9027271,
        lng: 18.3328861,
        value: true
      },
      {
        name: 'Corsano',
        lat: 39.8888851,
        lng: 18.3674097,
        value: true
      },
      {
        name: 'Gagliano del Capo',
        lat: 39.8432082,
        lng: 18.3691496,
        value: true
      },
      {
        name: 'Miggiano',
        lat: 39.9612344,
        lng: 18.3119951,
        value: true
      },
      {
        name: 'Morciano di Leuca',
        lat: 39.8473057,
        lng: 18.3108947,
        value: true
      },
      {
        name: 'Nociglia',
        lat: 40.0380447,
        lng: 18.3287192,
        value: true
      },
      {
        name: 'Patù',
        lat: 39.8397876,
        lng: 18.3390086,
        value: true
      },
      {
        name: 'Presicce',
        lat: 39.9022785,
        lng: 18.26223,
        value: true
      },
      {
        name: 'Ruffano',
        lat: 39.9814862,
        lng: 18.2484557,
        value: true
      },
      {
        name: 'Salve',
        lat: 39.8609955,
        lng: 18.2948136,
        value: true
      },
      {
        name: 'Specchia',
        lat: 39.9403563,
        lng: 18.2980659,
        value: true
      },
      {
        name: 'Taurisano',
        lat: 39.9569847,
        lng: 18.2197121,
        value: true
      },
      {
        name: 'Tiggiano',
        lat: 39.9032624,
        lng: 18.3652988,
        value: true
      },
      {
        name: 'Tricase',
        lat: 39.9292797,
        lng: 18.3533423,
        value: true
      },
      {
        name: 'Ugento',
        lat: 39.9247461,
        lng: 18.1607648,
        value: true
      }]
    };

    return filters_json;

});
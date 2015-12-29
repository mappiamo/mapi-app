angular.module('gal.filters.services', [])

.factory('$filters', function ($http, async, _, MAPPIAMO, pdb, DB, S, $language) {

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

        console.log('get filters ****')

        pdb.open(DB.name, function (db) {
            pdb.get(db, self._id, function (err, data) {
              if (err) {
                
                var f = {
                  _id: self._id,
                  _rev: '',
                  ages: [],
                  categories: [],
                  cities: self.cities
                };

                self.getAges(function (err, ages) {
                  f.ages = ages;
                });

                self.getCategory(function (err, cat) {
                  f.categories = cat;
                }); 

                ret = f;
              } else {

                self.getAges(function (err, ages) {
                  data.ages = ages;
                });

                self.getCategory(function (err, cat) {
                  data.categories = cat;
                });

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

      /*
      
      Contemporanea
Medievale
Medievale-Moderna
Messapica
Messapico-Romana
Moderna
Pre-protostorica
Romana
Romano-Medievale

      Contemporary
Medieval
Medieval-Modern
Messapica
Messapian-Roman
Moderna
Pre-proto
Romana
Roman-Medieval


      */

      // epoca
      ages: [
        {
          name: 'Contemporanea',
          lang: {
            en: 'Contemporary',
            it: 'Contemporanea'
          },
          value: true
        },
        {
          name: 'Medievale',
          lang: {
            en: 'Medieval',
            it: 'Medievale'
          },
          value: true
        },
        {
          name: 'Medievale-Moderna',
          lang: {
            en: 'Medieval-Modern',
            it: 'Medievale-Moderna'
          },
          value: true
        },
        {
          name: 'Messapica',
          lang: {
            en: 'Messapica',
            it: 'Messapica'
          },
          value: true
        },
        {
          name: 'Messapico-Romana',
          lang: {
            en: 'Messapian-Roman',
            it: 'Messapico-Romana'
          },
          value: true
        },
        {
          name: 'Moderna',
          lang: {
            en: 'Moderna',
            it: 'Moderna'
          },
          value: true
        },
        {
          name: 'Pre-protostorica',
          lang: {
            en: 'Pre-proto',
            it: 'Pre-protostorica'
          },
          value: true
        },
        {
          name: 'Romana',
          lang: {
            en: 'Romana',
            it: 'Romana'
          },
          value: true
        },
        {
          name: 'Romano-Medievale',
          lang: {
            en: 'Roman-Medieval',
            it: 'Romano-Medievale'
          },
          value: true
        }
      ],

      /*

      Architettura Civile
Architettura Militare
Architettura Religiosa
Architettura Rurale
Archeologia
Archeologia Industriale
Paesaggio e Natura
Parco naturale
Sito pluristratificato

      Civil Architecture
Military Architecture
Religious Architecture
Rural Architecture
Archeology
Industrial Archaeology
Landscape and Nature
Natural Parks
Site multilayered

      */

      _getData: function (data, done) {

        var self = this;

        $language.get(function (err, result) {

          //console.log('language: ' + result);
              
          async.each(data, function (item, callback) {
            if (result == 'it') {
              item.name = item.lang.it;
            } else if (result == 'en') {
              item.name = item.lang.en;
            };
            callback();
          }, function (err) {
            //console.log('Routes: ' + JSON.stringify(self.routes));
            done(err, data);
          })

        });

      },

      getAges: function (done) {
        var self = this;
        this._getData(self.ages, done);
      },

      getCategory: function (done) {
        var self = this;
        this._getData(self.categories, done);
      },

      // cateorie punti di interesse
      categories: [
        {
          name: 'Architettura Civile',
          lang: {
            en: 'Civil architecture',
            it: 'Architettura Civile'
          },
          value: true
        },
        {
          name: 'Architettura Militare',
          lang: {
            en: 'Military Architecture',
            it: 'Architettura Militare'
          },
          value: true
        },
        {
          name: 'Architettura Religiosa',
          lang: {
            en: 'Civil architecture',
            it: 'Architettura Religiosa'
          },
          value: true
        },
        {
          name: 'Architettura Rurale',
          lang: {
            en: 'Rural Architecture',
            it: 'Architettura Rurale'
          },
          value: true
        },
        {
          name: 'Archeologia',
          lang: {
            en: 'Archeology',
            it: 'Archeologia'
          },
          value: true
        },
        {
          name: 'Archeologia Industriale',
          lang: {
            en: 'Industrial Archaeology',
            it: 'Archeologia Industriale'
          },
          value: true
        },
        {
          name: 'Paesaggio e Natura',
          lang: {
            en: 'Landscape and Nature',
            it: 'Paesaggio e Natura'
          },
          value: true
        },
        {
          name: 'Parco Naturale',
          lang: {
            en: 'Natural Parks',
            it: 'Parco Naturale'
          },
          value: true
        },
        {
          name: 'Sito pluristartificato',
          lang: {
            en: 'Site multilayered',
            it: 'Sito pluristartificato'
          },
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
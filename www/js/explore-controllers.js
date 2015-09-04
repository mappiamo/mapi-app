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

var ctrls = angular.module('gal.explore.controllers', ['leaflet-directive']);

// *****************************
// **
// **
// ** lista degli itinerari

ctrls.controller('ExploreCtrl', function ($scope, Gal, $ionicLoading, $utility, $ionicPopup, DataSync, $cordovaFileTransfer, $cordovaProgress, async, $cordovaFile, _, $ionicLoading) {

  $scope.dataOk = false;
  var reset = true;
  // var test = true;

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Download dei dati',
      template: 'Il download dei dati può durare molto tempo. Sei sicuro?'
    });
    
    confirmPopup.then(function(res) {
      if (res) {

        console.log('Si. Sono sicuro');

        showSpinner(true);

        // comincia il download dei dati
        DataSync.download(function (err, data, pois) {
          console.log('saved ...');
          // save attachments
          // _downloadMedia(data, pois);
          showSpinner(false);
        }, reset);
      } else {
        console.log('No. Aspetto un secondo momento.');
      }
    });

  };

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };

  /*
  function _downloadMedia(data, pois) {

    console.log('download media for data n: ' + _.size(data));
    _downloadDataMedia(data);

    console.log('download media for pois n: ' + _.size(pois));
    _downloadDataMedia(pois);

  };

  function _downloadDataMedia(data) {

    async.each(data, function (item, callback) {

      _saveMedia(item.media);
      callback();

    }, function (err) {
      console.log('done transfer image.');
      showSpinner(false);
    });

  };

  function _saveMedia(media) {

    // console.log(JSON.stringify(media));
    var i = 0;

    showSpinner(true);
    console.log('--------------------------------');

    async.each(media, function (item, callback) {

      var url = item.url;
      // console.log('transfer file : ' + url);

      console.log('item : ' + JSON.stringify(item));
      console.log('transfer file : ' + url);      
      console.log('--------------------------------');

      // if (test) {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
          var arrayBuffer = oReq.response; // Note: not oReq.responseText
          
          // console.log(arrayBuffer);

          if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            for (var i = 0; i < byteArray.byteLength; i++) {
              // do something with each byte in the array
              console.log((i / byteArray.byteLength) * 100, "Downloading " + item.title + ' ... ');
              showSpinner(true, parseInt((i / byteArray.byteLength) * 100) + ' %');
            };
          };

          _saveImage(item._id, i, item.title, arrayBuffer);
          i++;
          callback(false);
        };

        oReq.send(null);
        showSpinner(false);

    }, function (err) {
      showSpinner(false);
      console.log('download media done.')
    });

  }

  function _saveImage(id, index, title, buffer) {
    
    DataSync.saveImage(id, title, index, buffer, function (err, response) {
      console.log(JSON.stringify(response));
    });
    
  };
  */

  $scope.download = function () {
    $scope.showConfirm();
  };

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };
  
  $scope.$on('$ionicView.enter', function(e) {
    _refresh();  
  });

  function _refresh() {
    $scope.routes = Gal.routes;
    $scope.dataOk = true;
    showSpinner(false); 
  };

  $scope.goHome = function () {
    window.location.href = '#/tab/home';
  };
  
});

// *****************************
// **
// **
// ** dettagli dell'itinerario

ctrls.controller('ExploreDetailCtrl', function ($scope, $stateParams, Gal, GeoJSON, S, Geolocation, $ionicLoading, leafletData, $geo, DataSync, $image) {

  var content = $stateParams.content;
  
  $scope.category = $stateParams.category;

  var it = Gal.getRoute(content);

  var geojson;
  var layer_geojson;
  var color;

  $scope.isMedia = false;
  $scope.dataOk = false;
  $scope.title = it.title;

  console.log('Explore details: ' + content);

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      Geolocation.get(_onSuccess, _onError);
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };

  function _onSuccess(position) {

    Geolocation.save(position);

    // init map  
    angular.extend($scope, {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 8
      },
        defaults: {
            scrollWheelZoom: false
        }
    });

  };

  function _onError(error) {
    console.log('error to get location ...')
  };

  function _geojson() {

      leafletData.getMap('map_explore').then(function(map) {

        if (layer_geojson) {
          map.removeLayer(layer_geojson);
        };

        layer_geojson = L.geoJson(geojson, {
          onEachFeature: function (feature, layer) {
            map.fitBounds(layer.getBounds());
          }
        });

        layer_geojson.addTo(map);

        map.invalidateSize();
    });

  };

  function _refresh() {

    console.log('Detail by content ' + content);

    Gal.content(content, function (err, data) {

      if (!err) {

        var dt = data.data;

        console.log(JSON.stringify(dt));

        data.text = S(S(dt.text).stripTags().s).decodeHTMLEntities().s;
        
        if (typeof dt.meta[3] !== undefined) {
          dt.meta[3].value = S(S(dt.meta[3].value).stripTags().s).decodeHTMLEntities().s;
        };

        if (typeof dt.meta[7] !== undefined) {
          dt.meta[7].value = S(S(dt.meta[7].value).stripTags().s).decodeHTMLEntities().s;
        };
      
        $scope.explore = dt;
        $scope.dataOk = true;

        // percorso dell'itinerario
        var geometry = $geo.parse(dt.route);

        geojson = {
          "type": "Feature",
          "geometry": geometry,
          "properties": {}
        };

        _geojson();

        // ----------------------------
        console.log('adding media...');
        $image.getData(dt.media, function (err, medias) {
          $scope.isMedia = true;
          $scope.medias = medias;  
        });

        showSpinner(false);
      
      };
    });
  };

});

// *****************************
// **
// **
// ** lista dei punti di interesse

ctrls.controller('PoiListCtrl', function ($scope, $stateParams, Gal, _, Geolocation, $ionicLoading) {
  
  var content = $stateParams.content;
  $scope.category = $stateParams.category;

  var it = Gal.getRoute(content);

  $scope.id = content;

  $scope.title = it.title;
  $scope.dataOk = false;
  
  console.log('Param content: ' + content);
  console.log('Param category: ' + $scope.category);

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  $scope.viewRoute = function (id, idpoi, lat, lon) {
    window.location.href = '#/tab/route/' + id + '/' + idpoi + '/' + lat + '/' + lon;
  };

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };

  $scope.goBack = function (id) {
    window.location.href = '#/tab/explore/' + id;
  };

  $scope.goMap = function (id) {
    console.log('go to map: ' + route_name);
    window.location.href = '#/tab/map/' + id;
  };

  function _refresh() {
    Gal.poi($scope.category, null, function (err, data) {
    // creo un file geojson con i dati 
    // la lista dei luoghi di interesse ordinati per coordinate
    // mappa da poter visualizzare
    // filtro dei punti di interesse
    if (!err) {
      
      console.log(JSON.stringify(data.data));

      var d_sorted = _.sortBy(data.data, function (item) {
        return Geolocation.distance(item.lat, item.lon);
      });

      if (_.size(d_sorted) == 0) {
        $scope.pois = data.data;
      } else {
        $scope.pois = d_sorted;
      };

      $scope.dataOk = true;
      showSpinner(false);
    }
  });
  };
  
});

// *****************************
// **
// **
// ** Mappa dei punti di interesse

ctrls.controller('PoiMapCtrl', function ($scope, $stateParams, Gal, leafletData, Geolocation, GeoJSON, $ionicLoading) {

  var marker;
  var layer_control;
  var geojson;
  var layer_geojson;

  var id = $stateParams.id;
  var it = Gal.getRoute(id);

  $scope.title = it.title;
  $scope.id = id;
  $scope.dataOk = false;
  
  console.log('Param Map: ' + id);

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
      _initMap();
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  $scope.goBack = function () {
    window.location.href = '#/tab/explore';
  };

  $scope.goList = function (route_name) {
    window.location.href = '#/tab/explore/{{route_name}}'
  };

  Geolocation.get(_onSuccess, _onError);

  function _onSuccess(position) {

    Geolocation.save(position);

    // init map  
    angular.extend($scope, {
      center: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 8
      },
        defaults: {
            scrollWheelZoom: false
        }
    });

    leafletData.getMap('map').then(function(map) {

      var ll = L.latLng(position.coords.latitude, position.coords.longitude);

        marker = L.userMarker(ll, {
          pulsing: true, 
          accuracy: 100, 
          smallIcon: true,
          opacity: 0.2
        });
        marker.addTo(map);

        map.setView([location.latitude, location.longitude], 9);

        map.invalidateSize();
    });

  };

  function _onError(error) {
    console.log('error to get location ...');
  };

  function _refresh() {
    Gal.poi(id, null, function (err, data) {
      if (!err) {
        // $scope.routes = data;
        console.log(JSON.stringify(data));
        GeoJSON.create(data, function (err, data_geojson) {
          geojson = data_geojson;
          // console.log(JSON.stringify(data_geojson));
          _geojson();
          $scope.dataOk = true;
          showSpinner(false);
        });
      }
    });
  };

  function _geojson() {

      leafletData.getMap('map').then(function(map) {

        layer_geojson = L.geoJson(geojson, {
          pointToLayer: function ( feature, latlng ) {

            var options_icon = { 
              icon: 'info-circle', 
              prefix: 'fa', 
              markerColor: 'blue', 
              iconColor: '#ffffff'
            };

            var icon = L.AwesomeMarkers.icon(options_icon);

            var descr = '<h3>' + feature.properties.title + '</h3><br />' +
                        '<p>' + feature.properties.address + '</p>';


            return L.marker(latlng, {
              icon: icon
            }).bindPopup(descr);

            /*
            console.log('icon: ' + feature.properties.marker);

            var galIcon = L.icon({
                iconUrl: 'img/markers/' + feature.properties.marker,
                
                iconSize:     [32, 37], // size of the icon
                shadowSize:   [50, 64], // size of the shadow
                iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            
            
            return L.marker(latlng, {icon: galIcon}).addTo(map).bindPopup(descr);
            */
            
          }
        });
                                       
        layer_geojson.addTo(map);

        map.invalidateSize();

    });

  };

  function _initMap () {

    leafletData.getMap('map').then(function(map) {

      var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var osmAttribution = 'Map data © OpenStreetMap contributors, CC-BY-SA';
      var osm = new L.TileLayer(osmUrl, {
        maxZoom: 18, 
        attribution: osmAttribution
      }).addTo(map);

      if (marker) {
        map.removeLayer(marker);
      };

      if (layer_control) {
        layer_control.removeFrom(map);
      };
                   
      if (layer_geojson) {
          map.removeLayer(layer_geojson);
      };

      var options_weather_layer = {
        showLegend: false, 
        opacity: 0.2 
      };

      var clouds = L.OWM.clouds(options_weather_layer);
      var city = L.OWM.current({intervall: 15, lang: 'it'});
      var precipitation = L.OWM.precipitation(options_weather_layer);
      var rain = L.OWM.rain(options_weather_layer);
      var snow = L.OWM.snow(options_weather_layer);
      var temp = L.OWM.temperature(options_weather_layer);
      var wind = L.OWM.wind(options_weather_layer);

      var baseMaps = { "OSM Standard": osm };
      var overlayMaps = { 
        "Clouds": clouds, 
        "Precipitazioni": precipitation,
        "Neve": snow,
        "Temperature": temp,
        "vento": wind,
        "Cities": city 
      };
      layer_control = L.control.layers(baseMaps, overlayMaps).addTo(map);
      
      map.invalidateSize();

    });
  };

});

// *****************************
// **
// **
// ** dettaglio del punto di interesse

ctrls.controller('PoiDetailCtrl', function ($scope, $stateParams, Gal, S, $ionicLoading, $geo, $image, leafletData) {

  $scope.category = $stateParams.category;
  var idpoi = $stateParams.idpoi;
  var lat = $stateParams.lat;
  var lng = $stateParams.lng;
  var layer_geojson;
  var geojson;

  $scope.id = $stateParams.category;

  console.log('Parameters: ' + $scope.category + ',' + idpoi);
  
  // var it = Gal.getRoute(id);

  // $scope.title = it.name;
  $scope.dataOk = false;

  $scope.goBack = function (id) {
    window.location.href = '#/tab/explore/' + id;
  };

  function showSpinner (view, message) {

      var msg = '<ion-spinner icon="lines"></ion-spinner>';

      if (typeof message !== 'undefined') {
        msg = message;
      };

      if (view) {  
        $ionicLoading.show({
            template: msg
        });
      } else {
        $ionicLoading.hide();
      }
  };

  $scope.$on('$ionicView.beforeEnter', function() {
      showSpinner(true);
  });

  $scope.$on('$ionicView.enter', function(e) {
    _refresh();
  });

  console.log('searching details poi by ' + idpoi);

  angular.extend($scope, {
      center: {
        lat: lat,
        lng: lng,
        zoom: 14
      },
      defaults: {
        scrollWheelZoom: false
      }
    });

  function _refresh() {

    Gal.poi($scope.category, idpoi, function (err, data) {
      // creo un file geojson con i dati 
      // la lista dei luoghi di interesse ordinati per coordinate
      // mappa da poter visualizzare
      // filtro dei punti di interesse

      if (!err) {

        var dt = data.data;

        // console.log(JSON.stringify(dt));

        $scope.poi = dt[0];
        $scope.dataOk = true;

        console.log('init map');

        _geojson(dt[0].route);

        // ----------------------------
        console.log('adding media... ' + _.size(dt[0].media));
        $image.getData(dt[0].media, function (err, medias) {
          $scope.isMedia = true;
          $scope.medias = medias;  
        });

        showSpinner(false);
      }
    });
  };

  function _geojson(route) {

      console.log('route: ' + JSON.stringify(route));
      var geometry = $geo.parse(route);
        
      var geojson = {
        "type": "Feature",
        "geometry": geometry,
        "properties": {}
      };

      console.log('geojson: ' + JSON.stringify(geojson));

      angular.extend($scope, {
          geojson: {
              data: geojson
              
          }
      });

      leafletData.getMap('map_poi').then(function(map) {
        var latlng = L.latLng(lat, lng);
        map.setView(latlng);
        map.setZoom(10);
      });
      

      /*
      leafletData.getMap('map').then(function(map) {

        if (layer_geojson) {
          map.removeLayer(layer_geojson);
        };

        layer_geojson = L.geoJson(geojson, {
          onEachFeature: function (feature, layer) {
            map.fitBounds(layer.getBounds());
          }
        });

        layer_geojson.addTo(map);

        map.invalidateSize();
    });
*/

  };

});

/*

{
  "id":12,
  "type":"place",
  "name":"serra-dei-peccatori",
  "title":"Serra dei Peccatori",
  "text":"<p>Nell'area a nord-Est del comune di Specchia, Serra Magnone denomina il tratto di serra che pi&ugrave; a sud prende il nome di Serra dei Peccatori e Serra dei Cianci, rispettivamente nel territorio di Specchia ed Alessano. La serra, quasi completamente coltivata ad ulivi ed organizzata in terrazzamenti su muretti a secco di contenimento, accoglie sulla cresta la Masseria del Monte, insediamento rurale con cappella dedicata a S.Antonio, risalente al XVII secolo, come riportato nell'incisione&nbsp; 'HOC VILLA FUNDITUS CONSTRUCTA/ ET DOTATA FUIT TEMPORE GUARDIA/.ATUS ....BONAVENTURA .../ A.D. 1604'.</p> \n<p>L'area &egrave; gi&agrave; fruibile ma &egrave; in programma un ulteriore intervento.</p> \n<p>Alle pendici della Serra, vicino al cimitero di Specchia, si erge la &quot;Collina degli inquietanti&quot;, opera a cielo aperto di Mario Branca, Marius in arte, costituita&nbsp;da particolari architetture rupestri dallo stile arcaico come la cappella di pietre a secco di Nostra Signora dell'Emigrante, cui si aggiungono ceramiche e assemblaggi in ferro.&nbsp;</p>",
  "address":"Area a Nord-Est di Specchia, Specchia",
  "lat":39.9453333358,
  "lon":18.2855000029,
  "route":"POINT(18.285500002856 39.945333335808)",
  "license":1,
  "created":"2015-05-15 20:20:38",
  "modified":"2015-07-07 19:52:20",
  "createdby":null,
  "modifiedby":null,
  "hits":0,
  "translation":false,
  "enabled":true,
  "meta":[
    {"name":"tipo_itine","value":"Fede"},
    {"name":"icon-file","value":"paesaggio-e-natura.png"},
    {"name":"categoria","value":"Paesaggio e Natura"},
    {"name":"tipologia","value":"Serra"},
    {"name":"proprieta","value":"Demaniale"},
    {"name":"accessibilita","value":"Accessibile"},
    {"name":"y","value":"4426860.199"},
    {"name":"x","value":"780700.1"},
    {"name":"notizie_storiche","value":"<p>Sul pendio della Serra dei Peccatori &egrave; possibile notare alcuni tratti di strada romana lastricata lungo la strada per Cardigliano. Due tratti, corrispondenti alla strada vicinale Cervi (250 m circa) e a via delle Tabacchine, sono la testimonianz"},
    {"name":"altri_oggetti_interesse","value":"84"},
    {"name":"num_gps","value":"41"}
    ],
  "media":[
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/lx/z2/vm/blob-lxz2vmxw61lwxx2n4dtpx4dc8.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/ky/b2/zz/blob-kyb2zzwuy8ij0u3zmneomsmo0.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/ao/n1/m7/blob-aon1m7fssr5f8pimvmkoh1h2o.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/0n/3c/zn/blob-0n3cznj4v4649253afuyyi8b7.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/ta/ao/e6/blob-taaoe6arqmfperjl4w9naoyyh.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/qh/6r/mi/blob-qh6rmi9yubdfhjdf4cxpa2ovs.data","default":null},
    {"title":"Serra dei Peccatori","url":"http://blobs.galpuglia.info/7s/3i/t3/blob-7s3it3jpw1vtd4afnvr26fcts.data","default":null}]}


*/



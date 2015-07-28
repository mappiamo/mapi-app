var ctrls = angular.module('gal.explore.controllers', ['leaflet-directive']);

ctrls.controller('ExploreCtrl', function($scope, Gal) {
  
  $scope.$on('$ionicView.enter', function(e) {
    $scope.routes = Gal.itinerari; 
  });

  $scope.goHome = function () {
    window.location.href = '#/tab/home';
  };
  
});

ctrls.controller('ExploreDetailCtrl', function($scope, $stateParams, Gal) {

  var id = $stateParams.id;

  console.log('Id Details: ' + id);

  Gal.detail(id, function (err, data) {
    if (!err) {
      $scope.poi = data[0];
    }
  });

});

ctrls.controller('ExploreListCtrl', function($scope, $stateParams, Gal) {
  
  var route = $stateParams.name;
  $scope.route_name = route;
  
  console.log('Param: ' + route);

  $scope.$on('$ionicView.enter', function(e) {
    //
  });

  $scope.goBack = function () {
    window.location.href = '#/tab/explore';
  };

  $scope.goMap = function (route_name) {
    console.log('go to map: ' + route_name);
    window.location.href = '#/tab/explore/map/{{route_name}}'
  };

  Gal.route(route, function (err, data) {
    // creo un file geojson con i dati 
    // la lista dei luoghi di interesse ordinati per coordinate
    // mappa da poter visualizzare
    // filtro dei punti di interesse
    if (!err) {
      $scope.routes = data;
    }
  });
  
});

ctrls.controller('ExploreMapCtrl', function($scope, $stateParams, Gal, leafletData, Geolocation, GeoJSON) {

  var marker;
  var layer_control;
  var geojson;
  var layer_geojson

  var route = $stateParams.name;
  $scope.route_name = route;
  
  console.log('Param Map: ' + route);

  // $scope.refresh(); 

  $scope.$on('$ionicView.enter', function(e) {
    // 
    _refresh();
  });

  $scope.goBack = function () {
    window.location.href = '#/tab/explore';
  };

  $scope.goList = function (route_name) {
    window.location.href = '#/tab/explore/{{route_name}}'
  };

  angular.extend($scope, {
    defaults: {
          scrollWheelZoom: true
      }
  });

  function _refresh() {
    _initMap();
    Gal.route(route, function (err, data) {
      if (!err) {
        // $scope.routes = data;
        GeoJSON.create(data, function (err, data_geojson) {
          geojson = data_geojson;
          console.log(JSON.stringify(data_geojson));
          _geojson();
        });
      }
    });
  };

  function _geojson() {

      leafletData.getMap('map').then(function(map) {

        layer_geojson = L.geoJson(geojson, {
          pointToLayer: function ( feature, latlng ) {

            console.log('icon: ' + feature.properties.marker);

            var galIcon = L.icon({
                iconUrl: 'img/markers/' + feature.properties.marker,
                
                iconSize:     [32, 37], // size of the icon
                shadowSize:   [50, 64], // size of the shadow
                iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            
            var descr = '<h3>' + feature.properties.title + '</h3><br />' +
                        '<p>' + feature.properties.address + '</p>';

            return L.marker(latlng, {icon: galIcon}).addTo(map).bindPopup(descr);
            
          }
        });
                                       
        layer_geojson.addTo(map);

        map.invalidateSize();

    });

  };

  function _initMap () {

    leafletData.getMap('map').then(function(map) {

      var location = Geolocation.location();

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

      // marker della posizione del device
      if (location.latitude != 0 && location.longitude != 0) {

        var ll = L.latLng(location.latitude, location.longitude);

        marker = L.userMarker(ll, {
          pulsing: true, 
          accuracy: 100, 
          smallIcon: true,
          opacity: 0.2
        });
        marker.addTo(map);

        map.setView([location.latitude, location.longitude], 9);
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



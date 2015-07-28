var ctrls = angular.module('gal.explore.controllers', []);

ctrls.controller('ExploreCtrl', function($scope, Gal) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

	$scope.routes = Gal.itinerari;

  
});

ctrls.controller('ExploreDetailCtrl', function($scope, $stateParams, Gal) {
  
  var route = $stateParams.name;
  
  console.log('Param: ' + route);

  $scope.route_name = route;

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



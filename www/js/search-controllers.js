var ctrls = angular.module('gal.search.controllers', ['leaflet-directive']);

// *****************************
// **
// **
// ** lista degli itinerari

ctrls.controller('SearchCtrl', function ($scope, Gal, $utility, $state, async, _, $ionicLoading, $language, $ui, $meta, $ionicModal, $filters) {

	$scope.isName = false;
	$scope.isAddress = false;
	$scope.isCat = false;
	$scope.isPois = false;

	var pois;
	var routesList;
	
	$ui.get('search', function (err, langUI) {
		$scope.ui = langUI;
	});

	$scope.searchValue = {
		name: '',
		category: '',
		address: ''
	};

	$scope.search = function () {
		console.log('Search values: ' + JSON.stringify($scope.searchValue));
		
		var d_search = _.filter(pois, function (item) {
			var isName = false;
			var isCat = false;

			if ($scope.searchValue.name != '') {
				isName = item.title == $scope.searchValue.name;
			};

			if ($scope.searchValue.category != '') {

				var i = _.find(item.meta, function (m) {
					return m.value == $scope.searchValue.category;
				});

				isCat = (typeof i != 'undefined');
			};	

			if (isCat || isName) {
				return item;
			};

		});

		$scope.pois = d_search;
		console.log('founded n.' + _.size(d_search));
		$scope.isPois = true;

	};

	$scope.selectPOI = function (poi) {

		// href="#/tab/poi/{{ content }}/{{ category }}/{{poi.id}}/{{poi.lat}}/{{poi.lon}}"

		var nameRoute = _.find(poi.meta, function (item) {
			return item.name = 'tipo_itine';
		});

		console.log('itinerario: ' + JSON.stringify(nameRoute));

		var i = _.find(routesList, function (item) {
          return item.title == nameRoute.value;
      	});

		var content = i._content;
		var category = i._categories;

		var url = '#/tab/poi/' + content + '/' + category + '/' + poi.id + '/' + poi.lat + '/' + poi.lon;
		console.log('go to ' + url);
		window.location.href = url;
		

	};	

	$scope.changeName = function () {
		$scope.searchValue.category = '';
	};

	$scope.searchAll = function () {
		$scope.searchValue.name = '';
		$scope.searchValue.category = '';
	};

	$scope.changeCat = function () {
		$scope.searchValue.name = '';
	};

	Gal.getRoutes(function (err, routes) {
		routesList = routes;
	});

	Gal.poiAll(function (err, data) {

		console.log('Pois n.' + _.size(data));
		// console.log(JSON.stringify(data[0]));

		pois = data;

		var d_sorted = _.sortBy(data, function (item) {
			return item.title;
		});
		$scope.names = _.pluck(d_sorted, 'title');

		/*
		var d_sorted = _.sortBy(data, function (item) {
			return item.address;
		});
		$scope.addresses = _.pluck(d_sorted, 'address');
		*/

		$filters.getCategory(function (err, data) {
			$scope.categories = data;
			$scope.isCat = true;
		});

		$scope.isName = true;
		$scope.isAddress = true;

		// console.log(JSON.stringify($scope.names));
		// console.log(JSON.stringify($scope.addresses))

	});

});
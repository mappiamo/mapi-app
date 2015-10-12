var ctrls = angular.module('gal.search.controllers', ['leaflet-directive']);

// *****************************
// **
// **
// ** lista degli itinerari

ctrls.controller('SearchCtrl', function ($scope, Gal, S, $utility, $state, async, _, $ionicLoading, $language, $ui, $meta, $ionicModal, $filters) {

	$scope.isText = false;
	$scope.isName = false;
	$scope.isAddress = false;
	$scope.isCat = false;
	$scope.isPois = false;
	$scope.isError = false;

	var pois;
	var routesList;
	
	$ui.get('search', function (err, langUI) {
		$scope.ui = langUI;
	});

	$scope.searchValue = {
		name: '',
		category: '',
		address: '',
		text: ''
	};

	$scope.search = function () {
		
		console.log('Search values: ' + JSON.stringify($scope.searchValue));
		$scope.isError = false;

		var d_search = _.filter(pois, function (item) {
			
			var isName = false;
			var isCat = false;
			var isText = false;
	
			if ($scope.searchValue.text != '') {
				var text_s = $scope.searchValue.text.toLowerCase();
				var title_s = item.title.toLowerCase();
				var address_s = item.address.toLowerCase(); 
				isText = S(title_s).contains(text_s) || 
						 S(address_s).contains(text_s);
			};

			if ($scope.searchValue.name != '') {
				isName = item.title == $scope.searchValue.name;
			};

			if ($scope.searchValue.category != '') {

				var i = _.find(item.meta, function (m) {
					return m.value == $scope.searchValue.category;
				});

				isCat = (typeof i != 'undefined');
			};	

			if (isCat || isName || isText) {
				return item;
			};

		});

		if (_.size(d_search) == 0) {
			$scope.isError = true;	
			$scope.error = 'Non ho trovato nessun Punto di Interesse';	
		};

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

		console.log('itinerario trovato: ' + JSON.stringify(i));      	

		var content = i._content;
		var category = i._categories;

		var url = '#/tab/poi/' + content + '/' + category + '/' + poi.id + '/' + poi.lat + '/' + poi.lon;
		console.log('go to ' + url);
		window.location.href = url;

	};	

	$scope.changeName = function () {
		$scope.searchValue.category = '';
		$scope.searchValue.text = '';
	};

	$scope.changeText = function () {
		$scope.searchValue.name = '';
		$scope.searchValue.category = '';
	};

	$scope.searchAll = function () {
		$scope.searchValue.text = '';
		$scope.searchValue.name = '';
		$scope.searchValue.category = '';
	};

	$scope.changeCat = function () {
		$scope.searchValue.name = '';
		$scope.searchValue.text = '';
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
		$scope.isText = true;

		// console.log(JSON.stringify($scope.names));
		// console.log(JSON.stringify($scope.addresses))

	});

});
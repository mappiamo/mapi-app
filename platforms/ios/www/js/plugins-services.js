angular.module('ionic.cordova.plugin', [])
	.factory("$cordovaPlugin", function ($ionicPlatform) {
		// $ionicPlatform.ready(function() {
			return cordova.plugins;
		// });
	})

	.factory("$cordova", function ($ionicPlatform) {
		// $ionicPlatform.ready(function() {
			return window.cordova;
		// });
	})



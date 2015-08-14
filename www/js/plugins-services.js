angular.module('ionic.cordova.plugin', [])
	.factory("$cordovaPlugin", function ($ionicPlatform) {
		$ionicPlatform.ready(function() {
			return window.cordova.plugins;
		});
	});



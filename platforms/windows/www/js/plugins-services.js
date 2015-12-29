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



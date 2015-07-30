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

var ctrls = angular.module('gal.real.controllers', ['cordovaDeviceMotion', 'cordovaCapture']);

// Realtà aumentata
ctrls.controller('RealCtrl', function($scope, $cordovaDeviceMotion, $cordovaCapture) {

	var w;

	console.log('Real init ...');

	$scope.accelerometer = function () {
		$cordovaDeviceMotion.accelerometer(function (err, acc) {
			console.log('Acceleration: ');
			var X = acc.x;
	      	var Y = acc.y;
	      	var Z = acc.z;
	      	var timeStamp = acc.timestamp;
	      	var msg = 'X: ' + X + ' Y:' + Y + ' - ' + timeStamp;
	      	$scope.coordinates = msg;
		});
	};

	$scope.watch = function () {
		$cordovaDeviceMotion.watch(function (err, acc, wId) {
			console.log('Watch: ');
			
			w = wId;
			var X = acc.x;
	      	var Y = acc.y;
	      	var Z = acc.z;
	      	var timeStamp = acc.timestamp;
	      	var msg = 'Watch X: ' + X + ' Y:' + Y + ' - ' + timeStamp;
	      	$scope.coordinates = msg;
		});
	};

	$scope.captureImage = function() {
	    console.log('capture init ...');

	    $cordovaCapture.getImage(function (err, imageData) {
	    	console.log('ok.');
	    	var smallImage = angular.element('#image_capture');
			smallImage.style.display = 'block';
      		smallImage.src = "data:image/jpeg;base64," + imageData;
	    });
	};
  
});
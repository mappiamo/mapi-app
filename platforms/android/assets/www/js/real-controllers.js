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
ctrls.controller('RealCtrl', function($scope, $cordovaDeviceMotion, $cordovaCapture, Geolocation, $cordovaDeviceOrientation) {

	var orientation = {
		magneticHeading: 0,
		trueHeading: 0,
		accuracy: 0,
		timeStamp: 0,
		location: {
			latitude: 0,
			longitude: 0
		}
	};

	// Create a variable to store the transform value
	$scope.transform = "rotate(0deg)";
	
	// When the number changes, update the transform string
	$scope.$watch("magnetic", function(val) {
	    $scope.transform = "rotate("+val+"deg)";
	});

	console.log('Real init ...');

	var location = Geolocation.location();

	orientation.location.latitude = location.latitude;
	orientation.location.longitude = location.longitude;

	console.log('Coordinate: ' + JSON.stringify(orientation.location));

	$scope.orientation = orientation;

	/*
	var canvas = new fabric.Canvas('canvas');

        var rect = new fabric.Rect({
            top : 100,
            left : 100,
            width : 60,
            height : 70,
            fill : 'red'
        });

        canvas.add(rect);

    var text = new fabric.Text('hello world', { left: 100, top: 100 });
	canvas.add(text);
	*/

	$scope.getOrientation = function () {

		console.log('device orietantion init ...');

		$cordovaDeviceOrientation.get(function(err, result) {

			console.log(JSON.stringify(result));

			orientation.magneticHeading = result.magneticHeading;

			$scope.magnetic = result.magneticHeading;

			orientation.trueHeading = result.trueHeading;
			orientation.accuracy = result.headingAccuracy;
			orientation.timeStamp = result.timestamp;

			$scope.orientation = orientation;

		}, function(err) {
		// An error occurred
			console.log('device orietantion error ...');
		});
	};

	/*
	$scope.captureImage = function() {
	    console.log('capture init ...');

	    $cordovaCapture.getImage(function (err, imageData) {
	    	console.log('ok.');
	    	$scope.image_capture = "data:image/jpeg;base64," + imageData;
	    });
	};
	*/
  
});
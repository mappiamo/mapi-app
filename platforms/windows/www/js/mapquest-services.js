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
 
angular.module("gal.mapquest", [])
	.factory("Mapquest", function() {
	  
	  return {
	      mapLayer: function () {
	      	return window.MQ.mapLayer()
	      },
	      direction: function () {
	      	return window.MQ.routing.directions()
	      },
	      routeLayer: function () {
	      	return window.MQ.routing.routeLayer()
	      }
	  };
});

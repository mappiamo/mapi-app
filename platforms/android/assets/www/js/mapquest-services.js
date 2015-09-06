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

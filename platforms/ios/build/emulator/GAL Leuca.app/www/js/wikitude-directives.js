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
 
angular.module('wikitude.directive', []).directive('loadScript', [function() {
    return function(scope, element, attrs) {
        angular.element('<script src="architect://architect.js"></script>').appendTo(element);
    }
}]);
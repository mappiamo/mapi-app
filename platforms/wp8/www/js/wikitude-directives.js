angular.module('wikitude.directive', []).directive('loadScript', [function() {
    return function(scope, element, attrs) {
        angular.element('<script src="architect://architect.js"></script>').appendTo(element);
    }
}]);
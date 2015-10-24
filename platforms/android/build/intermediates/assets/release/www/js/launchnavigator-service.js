angular.module('gal.launchnavigator', []).factory('$launchnavigator', function() {
    
    var lnav = {
    	navigate: function() {
    		return cordova.plugins.launchnavigator.navigate;		
    	}
    }

    return lnav;

});
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

angular.module('gal.startApp', []).factory('$startApp', function() {
    return {
    	run: function (nameApp, callback) {

    		navigator.startApp.start(nameApp, function(message) { /* success */
		    	console.log('Start App ' + nameApp + ' Ok.' + message); // => OK
		    	callback(false, message);
			}, 
			function(error) { /* error */
			    console.log('Start App ' + nameApp + ' with error: ' + error);
			    callback(true, error);
			});
			
    	}
    } 
});

'use strict';

/**
 * @ngdoc service
 * @name himatesApp.AppServices
 * @description
 * # AppServices
 * Service in the himatesApp.
 */
angular.module('himatesApp')
  .service('AppServices', function AppServices() {
  	var baseUrl = 'https://himates.firebaseio.com';

    return {
    	fbUrl: function(path) {
    		path = path || '';
    		var startsWithSlash = (path && path.length > 0) ? path[0] == '/' : false;
    		if (!startsWithSlash) {
    			path = '/' + path;
    		}
    		return baseUrl + path;
    	}
    }
  });

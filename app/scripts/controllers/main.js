'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
	.controller('MainCtrl', function() {
		FastClick.attach(document.body);
		$(window).scrollTop(0);
	});

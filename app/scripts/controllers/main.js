'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
	.controller('MainCtrl', function($scope, $mdMedia, AppServices) {
		$scope.$mdMedia = $mdMedia;

		$scope.getRealName = function(user) {
		  return AppServices.getRealName(user || $rootScope.user);
		}

		$scope.getFirstName = function(user) {
		  return AppServices.getFirstName(user || $rootScope.user);
		}

		$scope.getAvatar = function(user) {
		  return AppServices.getAvatar(user || $rootScope.user);
		}

		$scope.getUserId = function(user) {
		  return AppServices.getUserId(user || $rootScope.user);
		}
	});

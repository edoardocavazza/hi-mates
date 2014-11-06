'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
	.controller('MainCtrl', function($scope, $rootScope, $http, $timeout, $q, $firebase) {
		FastClick.attach(document.body);
		$(window).scrollTop(0);

		var fbUrl = 'https://himates.firebaseio.com/';
		var rootRef = new Firebase(fbUrl);
		var user = rootRef.getAuth();
		$rootScope.user = user;

		$scope.authServices = [];

		$scope.filter = 'date';

		$scope.setFilter = function(f) {
			$scope.filter = f;
		}

		$timeout(function() {
			$scope.authServices.push({
					name: 'facebook'
				});
			$scope.authServices.push({
					name: 'google'
				});
			$scope.authServices.push({
					name: 'twitter'
				});
			$scope.authServices.push({
					name: 'github'
				});
		}, 1000);

		$scope.hasSubscriptions = function(obj) {
			for (var k in obj) return true;
			return false;
		}

		$scope.getNumberArray = function(n) {
			var ar = [];
			for (var i = 0; i < n; i++) ar.push(i);
			return ar;
		}

		$scope.login = function(provider) {
			var deferred = $q.defer();
			rootRef.authWithOAuthPopup(provider, function (err, user) {
	            if (err) {
	                deferred.reject(err);
	            }
	            if (user) {
	                deferred.resolve(user);
	                $rootScope.$apply(function() {
						$rootScope.user = user;
					});
	            }
	        });

	        return deferred.promise;
		}

		$scope.logout = function() {
			user = rootRef.getAuth();
			rootRef.offAuth(function() {
				$rootScope.$apply(function() {
					$rootScope.user = {};
				});
			});
		}

		$rootScope.loading = true;
		$rootScope.loadingDataClass = function() {
			return $rootScope.loading ? 'loading' : 'loaded';
		}

	});

'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('ProfileCtrl', function ($scope, $firebase, $stateParams, AppServices, Auth) {
    var id = $stateParams.profileId;
    $scope.profileUser = {};
    if (id) {
    	var userRef = new Firebase(AppServices.fbUrl('users/' + id));
    	var userObj = $firebase(userRef).$asObject();
    	userObj.$loaded(function() {
    		$scope.profileUser = userObj;
    	});
    } else {
    	$scope.profileUser = Auth.getUser();
    }

    $scope.canAddAccounts = function() {
    	if ($scope.profileUser && $scope.profileUser.$id) {
      		return $scope.profileUser.$id == Auth.getUser().$id;
  		} else {
  			return false;
  		}
    }
  });

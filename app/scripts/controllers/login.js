'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('LoginCtrl', function ($scope, $rootScope, $http, $timeout, $q, $firebase, Auth) {
    $scope.authServices = [];
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
    }, 2000);

    $scope.login = function(provider) {
      return Auth.login(provider);
    }

    $scope.logout = function(provider) {
      return Auth.logout(provider);
    }
  });

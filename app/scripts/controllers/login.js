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
    $scope.loggedService = [];
    var user = Auth.getUser();
    if (!user || !user.facebook) {
      $scope.authServices.push({
          name: 'facebook'
        });
    } else {
      $scope.loggedService.push({
        name: 'facebook'
      })
    }
    if (!user || !user.google) {
      $scope.authServices.push({
        name: 'google'
      });
    } else {
      $scope.loggedService.push({
        name: 'google'
      })
    }
    if (!user || !user.twitter) {
      $scope.authServices.push({
        name: 'twitter'
      });
    } else {
      $scope.loggedService.push({
        name:'twitter'
      })
    }
    if (!user || !user.github) {
      $scope.authServices.push({
        name: 'github'
      });
    } else {
      $scope.loggedService.push({
        name: 'github'
      })
    }

    $scope.login = function(provider) {
      return Auth.login(provider);
    }

    $scope.logout = function(provider) {
      return Auth.logout(provider);
    }
  });

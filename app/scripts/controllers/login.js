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
    var services = ['facebook', 'google', 'twitter', 'github'];
    $scope.authServices = {};
    $scope.loggedService = {};
    
    var updateServices = function(user) {
      for (var k in services) {
        var s = services[k];
        if (!user || !user[s]) {
          $scope.authServices[s] = true;
          $scope.loggedService[s] = false;
        } else {
          $scope.authServices[s] = false;
          $scope.loggedService[s] = true;
        }
      }
    }

    $scope.hasAuthServices = function() {
      for (var k in $scope.authServices) {
        if ($scope.authServices[k]) return true;
      }
      return false;
    }

    if (!Auth.isLogged()) {
      $timeout(function() {
        updateServices(null);
      }, 1000);
    }

    $rootScope.$watch('user', function(val) {
      if (val) {
        updateServices(val);
      }
    }, true);

    $scope.login = function(provider) {
      return Auth.login(provider);
    }

    $scope.logout = function() {
      return Auth.logout();
    }

    $scope.logoutProvider = function(provider) {
      Auth.logoutProvider(provider);
    }

  });

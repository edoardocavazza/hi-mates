'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:GroupsCtrl
 * @description
 * # GroupsCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('GroupsCtrl', function ($scope, $firebase, AppServices) {
    var eventsRef = new Firebase(AppServices.fbUrl('groups'));
    $scope.groups = $firebase(eventsRef).$asArray();
  });

'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:GroupsCtrl
 * @description
 * # GroupsCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('GroupsCtrl', function ($scope, $firebase) {
    var fbUrl = 'https://himates.firebaseio.com/groups';
    var eventsRef = new Firebase(fbUrl);
    $scope.groups = $firebase(eventsRef).$asArray();
  });

'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventsCtrl', function ($scope, $firebase) {
    var fbUrl = 'https://himates.firebaseio.com/events';
    var eventsRef = new Firebase(fbUrl);
    $scope.events = $firebase(eventsRef).$asArray();
  });

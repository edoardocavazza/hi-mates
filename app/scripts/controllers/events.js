'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventsCtrl', function ($scope, $firebase, Modal, Auth, $state) {
    var fbUrl = 'https://himates.firebaseio.com/events';
    var eventsRef = new Firebase(fbUrl);
    $scope.events = $firebase(eventsRef).$asArray();

    $scope.event = {
    	creator: Auth.getUser().$id
    };

    $scope.openEvent = function(ev) {
    	$state.go('event.view', {
    		currentEvent: ev
    	});
    }

    $scope.createEvent = function() {
    	Modal.show($scope, {
    		type: 'confirm',
    		content: 'partials/create-event.html'
    	})
    }

    $scope.addEvent = function(obj) {
    	$scope.event.createdAt = $scope.event.updatedAt = (new Date()).valueOf();
    	$scope.events.$add(obj);
    	$scope.events.$save();
    }

  });

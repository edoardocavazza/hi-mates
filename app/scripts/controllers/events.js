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
    		eventId: ev.$id
    	});
    }

    $scope.createEvent = function() {
    	Modal.show($scope, {
    		type: 'confirm',
    		content: 'partials/create-event.html'
    	})
    }

    $scope.addEvent = function(obj) {
        obj.createdAt = obj.updatedAt = (new Date()).valueOf();
        var newChildRef = eventsRef.push();
        newChildRef.set(obj);
    	$scope.events.$save();
        $state.go('event.view', {
            eventId: newChildRef.key()
        });
    }

    $scope.deleteEvent = function(id, title) {
        var ev = eventsRef.child(id);
        var ref = $firebase(ev);
        var modal = Modal.show($scope, {
            type: 'confirm',
            message: 'Do you really want remove this event "' + title + '"?',
            okLabel: 'yes',
            cancelLabel: 'cancel'
        });
        modal.promise.then(function() {
            modal.hide();
            ref.$remove().then(function() {
                //
            }, function() {
                //
            });
            $state.go('dashboard');
        });
    }

  });

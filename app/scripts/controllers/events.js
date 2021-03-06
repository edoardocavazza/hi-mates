'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventsCtrl
 * @description
 * # EventsCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventsCtrl', function ($scope, $firebase, $state, $stateParams, Modal, AppServices, Auth) {
  var eventsRef = new Firebase(AppServices.fbUrl('events'));
  $scope.events = $firebase(eventsRef).$asArray();

  $scope.openEvent = function(ev) {
    $state.go('event.view', {
      eventId: ev.$id || ev.id
    });
  }

  $scope.editEvent = function(ev) {
    $state.go('event.edit', {
      eventId: ev.$id || ev.id
    });
  }

  $scope.saveEvent = function(obj) {
    if (obj.$id) {
      obj.updatedAt = (new Date()).valueOf();
      obj.$save();
      $state.go('event.view', {
        eventId: obj.$id
      });
    } else {
      $scope.addEvent(obj);
    }
  }

  $scope.addEvent = function(obj) {
    obj.createdAt = obj.updatedAt = (new Date()).valueOf();
    $scope.events.$add(obj).then(function(newChildRef) {
      $state.go('event.view', {
        eventId: newChildRef.key()
      });
    });
  }

  $scope.deleteEvent = function(obj) {
    var ev = eventsRef.child(obj.$id);
    var ref = $firebase(ev);
    var modal = Modal.show($scope, {
      type: 'confirm',
      message: 'Do you really want remove this event "' + obj.title + '"?',
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

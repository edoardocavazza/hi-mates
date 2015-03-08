'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventCtrl', function ($scope, $rootScope, $http, $q, $firebase, $timeout, $stateParams, AppServices, Auth, EventHandler, chArrayHandler) {
    var isNew = $stateParams.eventId ? false : true;

    $scope.availableDates = [];
    $scope.eventDatesAlias = [];
    $scope.preferredDays = [];
    $scope.filter = 'date';

    $scope.minDate = new Date();
    $scope.maxDate = null;

    $scope.preventPast = function(day) {
      return day.valueOf() >= Date.now();
    }

    $scope.setFilter = function(f) {
      $scope.filter = f;
    }

    $scope.hasUserRejected = function(ev, user) {
      return EventHandler.hasUserRejected(ev || $scope.currentEvent, user || Auth.getUser());
    }

    $scope.getEventSubscriptionsLength = function(ev) {
      return EventHandler.getEventSubscriptionsLength(ev || $scope.currentEvent);
    } 

    $scope.getEventRejectionsLength = function(ev) {
      return EventHandler.getEventRejectionsLength(ev || $scope.currentEvent);
    }

    var lastSubscriptionsByDate = [];
    $scope.getSubscriptionsByDate = function(ev) {
      var res = EventHandler.getSubscriptionsByDate(ev || $scope.currentEvent);
      return lastSubscriptionsByDate = chArrayHandler.mergeObjectsArray(lastSubscriptionsByDate, res, {
        merge: 'replace',
        lookAt: ['time']
      });
    }

    var indexOfDatesArray = function(date, dates) {
      var time = date.valueOf();
      for (var k = 0; k < dates.length; k++) if (dates[k].valueOf() == time) return k;
      return -1;
    }

    $scope.userDates = [];
    $scope.userRejected = false;

    var startWatchUserRejected = function() {
      var userDatesBeforeReject = [];
      $scope.$watch('userRejected', function(val, old) {
        if (val != old) {
          var user = Auth.getUser();
          if (val) {
            if (!old) {
              userDatesBeforeReject = angular.copy($scope.userDates);
            }
            $scope.userDates = [];
            $scope.currentEvent.rejected = $scope.currentEvent.rejected || [];
            var index = $scope.currentEvent.rejected.indexOf(user.$id);
            if (index == -1) {
              $scope.currentEvent.rejected.push(user.$id);
            }
          } else {
            if (old && userDatesBeforeReject) {
              $scope.userDates = userDatesBeforeReject;
            }
            $scope.currentEvent.rejected = $scope.currentEvent.rejected || [];
            var index = $scope.currentEvent.rejected.indexOf(user.$id);
            if (index >= 0) {
              if ($scope.currentEvent.rejected.length > 1) { 
                $scope.currentEvent.rejected.slice(index, 1);
              } else {
                $scope.currentEvent.rejected = [];
              }
            }
          }
          $scope.currentEvent.$save();
        }
      });
    }

    var startWatchUserDates = function() {
      $scope.$watch('userDates', function(val, old) {
        if (val !== old) {
          var user = Auth.getUser();
          if ($scope.currentEvent) {
            var userSubs = EventHandler.getUserSubscriptions($scope.currentEvent, user) || [];
            var newUserSubs = [];
            for (var i = 0; i < val.length; i++) {
              newUserSubs.push({
                date: new Date(val[i]).valueOf()
              })
            }
            EventHandler.setUserSubscriptions($scope.currentEvent, user, newUserSubs);
          }
          $scope.currentEvent.$save();
        }
      }, true);
    }

    $scope.availableDatesFilter = function(day) {
      var dates = $scope.currentEvent.availableDates;
      if (dates) {
        for (var i = 0; i < dates.length; i++) {
          if (moment(dates[i]).format('YYYY/M/D') === moment(day).format('YYYY/M/D') && day.valueOf() >= Date.now()) {
            return true;
          }
        }
      }
      return false;
    }

    $scope.$watch('availableDates', function(val) {
      var res = [];
      if (val && val.length > 0) {
        for (var k = 0; k < val.length; k++) {
          res.push(val[k].valueOf());
          $scope.maxDate = val[k];
        }
      } else {
        $scope.maxDate = null;
      }
      $scope.currentEvent.availableDates = res;
    }, true);

    if (isNew) {
      $scope.currentEvent = {
        creator: Auth.getUser().$id
      }
    } else {
      $scope.currentEvent = EventHandler.getEventById($stateParams.eventId);
      $scope.loading = true;
      $scope.currentEvent.$loaded(function() {
        $scope.loading = false;
        $scope.userRejected = EventHandler.hasUserRejected($scope.currentEvent, Auth.getUser());
        $scope.availableDates = EventHandler.getAvailableDates($scope.currentEvent);
        $scope.userDates = EventHandler.getUserSubscriptionDates($scope.currentEvent, Auth.getUser());
        startWatchUserDates();
        startWatchUserRejected();
      });
    }

    $scope.datePicker = new Date();
  });

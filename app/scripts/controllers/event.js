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
          //console.log('on change:', angular.copy($scope.currentEvent.dates), ($scope.currentEvent.dates || []).length);
          // if ($scope.currentEvent && $scope.currentEvent.dates) {
          //   var deleted = 0;
          //   var length = $scope.currentEvent.dates.length
          //   for (var k = 0; k < length; k++) {
          //     var d = new Date($scope.currentEvent.dates[k - deleted].timestamp);
          //     var userIndexOf = indexOfDatesArray(d, dates);
          //     if (userIndexOf == -1) {
          //       //user removed this date
          //       var users = $scope.currentEvent.dates[k - deleted].users;
          //       var index = users.indexOf(user.$id);
          //       if (index >= 0) {
          //         if (users.length > 1) {
          //           $scope.currentEvent.dates[k - deleted].users.splice(index, 1);
          //         } else {
          //           $scope.currentEvent.dates.splice(k - deleted, 1);
          //           deleted += 1;
          //         }
          //       }
          //     } else {
          //       dates.splice(userIndexOf, 1);
          //       var users = $scope.currentEvent.dates[k - deleted].users;
          //       if (users.indexOf(user.$id) == -1) {
          //         $scope.currentEvent.dates[k - deleted].users.push(user.$id);
          //       }
          //     }
          //   }
          // }
          // //console.log('removed:', angular.copy($scope.currentEvent.dates), ($scope.currentEvent.dates || []).length);
          // //console.log('try to add:', angular.copy(dates));
          // if (dates.length > 0) {
          //   for (var z = 0; z < dates.length; z++) {
          //     $scope.currentEvent.dates = $scope.currentEvent.dates || [];
          //     var d = dates[z];
          //     var indexOf = indexOfDatesArray(d, $scope.currentEvent.dates);
          //     if (indexOf == -1) {
          //       var str = valToDate(d.valueOf());
          //       $scope.currentEvent.dates.push({
          //         date: str,
          //         timestamp: d.valueOf(),
          //         users: [user.$id]
          //       });
          //     }
          //   }
          // }
          //console.log('before save:', angular.copy($scope.currentEvent.dates), ($scope.currentEvent.dates || []).length);
          $scope.currentEvent.$save();
        }
      }, true);
    }

    var updateCalendar = function() {
      /*var dates = $scope.currentEvent.dates;
      if (dates) {
        var box = {};
        for (var k = 0; k < dates.length; k++) {
          var d = dates[k].timestamp;
          box[d] = dates[k];
        }
        var deleted = 0;
        for (var k = 0; k < $scope.eventDatesAlias.length; k++) {
          var index = k - deleted;
          var time = $scope.eventDatesAlias[index].timestamp;
          if (!box[time]) {
            $scope.eventDatesAlias.splice(index, 1);
            deleted += 1;
          } else {
            $scope.eventDatesAlias[index]['users'] = box[time].users;
            delete box[time];
          }
        }
        for (var k in box) {
          $scope.eventDatesAlias.push(box[k]);
        }

        var ar = [];
        var max = 0;
        var rejected = $scope.currentEvent.rejected || [];
        for (var k = 0; k < dates.length; k++) {
          var d = dates[k];
          if (d.users) {
            var usersAvailable = [];
            for (var j = 0; j < d.users.length; j++) {
              var uid = d.users[j];
              if (rejected.indexOf(uid) == -1) {
                usersAvailable.push(d.users[j]);
              }
            }
            if (usersAvailable.length > max) {
              max = usersAvailable.length;
              ar = [];
            }
            if (max == usersAvailable.length) {
              ar.push(new Date(dates[k].timestamp));
            }
          }
        }
        $scope.preferredDays = ar;
      } else {
        $scope.eventDatesAlias = [];
        $scope.preferredDays = [];
      }*/
    }

    $scope.$watch('availableDates', function(val) {
      var res = [];
      for (var k = 0; k < val.length; k++) {
        res.push(val[k].valueOf());
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
        updateCalendar();
        //$scope.currentEvent.$watch(updateCalendarDigest);
      });
    }

    $scope.datePicker = new Date();
  });

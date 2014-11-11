'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventCtrl', function ($scope, $rootScope, $http, $q, $firebase, $timeout, $stateParams, Auth) {
    var fbUrl = 'https://himates.firebaseio.com/';
    var eventRef = new Firebase(fbUrl + 'events/' + $stateParams.eventId);
    var datesRef = eventRef.child('dates');
    var datesRef = eventRef.child('dates');
    var eventSync = $firebase(eventRef).$asObject();
    $scope.currentEvent = {
      id: $stateParams.eventId,
      title: '',
      rejected: [],
      dates: []
    };

    $scope.filter = 'date';
    $scope.preferredDays = [];
    $scope.usersProfiles = {}

    $scope.getProfile = function(id) {
      if (!$scope.usersProfiles[id]) {
        var usersRef = new Firebase(fbUrl + 'users');
        var requested = usersRef.child(id);
        var sync = $firebase(requested).$asObject();
        $scope.usersProfiles[id] = {};
        sync.$loaded(function() {
          $scope.usersProfiles[id] = sync;
        });
      }
      return $scope.usersProfiles[id];
    }

    $scope.setFilter = function(f) {
      $scope.filter = f;
    }

    var addZero = function(no) {
      if (no < 10){
        return "0" + no;
      }  else {
        return no; 
      }
    }

    var valToDate = function(v) {
      var d = new Date(parseInt(v));
      var ds  = [
        addZero(d.getDate()),
        addZero(d.getMonth() + 1),
        addZero(d.getFullYear())
      ].join('/');
      return ds;
    }

    $scope.getPreferencesNumber = function() {
      var n = 0;
      if (eventSync && eventSync.dates) {
        var ar = [];
        for (var k in eventSync.dates) {
          var d = eventSync.dates[k];
          var users = d.users || [];
          for (var j in users) {
            var u = users[j];
            if (ar.indexOf(u) == -1) ar.push(u);
          }
        }
        n = ar.length;
      }

      if (n == 0) {
        return 'Nobody has';
      } else if (n == 1) {
        return 'Just 1 mate has';
      } 

      return n + ' mates have';
    } 

    $scope.getRejectedNumber = function() {
      var n = 0;
      if (eventSync && eventSync.rejected) {
        n = eventSync.rejected.length;
      }

      if (n == 0) {
        return false;
      } else if (n == 1) {
        return '1 mate';
      }
      return n + ' mates';
    }

    $scope.hasSubscriptions = function(obj) {
      if (eventSync && eventSync.dates && eventSync.dates.length > 0){
        return true;
      }
      return false;
    }

    var getUserDates = function() {
      var user = Auth.getUser();
      var dates = [];
      if (eventSync && eventSync.dates) {
        for (var k in eventSync.dates) {
          var d = eventSync.dates[k];
          if (d.users.indexOf(user.$id) != -1) dates.push( new Date(d.timestamp) );
        }
      }

      return dates;
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
            eventSync.rejected = eventSync.rejected || [];
            var index = eventSync.rejected.indexOf(user.$id);
            if (index == -1) {
              eventSync.rejected.push(user.$id);
            }
          } else {
            if (old && userDatesBeforeReject) {
              $scope.userDates = userDatesBeforeReject;
            }
            eventSync.rejected = eventSync.rejected || [];
            var index = eventSync.rejected.indexOf(user.$id);
            if (index >= 0) {
              if (eventSync.rejected.length > 1) { 
                eventSync.rejected.slice(index, 1);
              } else {
                eventSync.rejected = [];
              }
            }
          }
          eventSync.$save();
        }
      });
    }

    var startWatchUserDates = function() {
      $scope.$watch('userDates', function(val, old) {
        if (val !== old) {
          var dates = angular.copy(val);
          var user = Auth.getUser();
          //console.log('on change:', angular.copy(eventSync.dates), (eventSync.dates || []).length);
          if (eventSync && eventSync.dates) {
            var deleted = 0;
            var length = eventSync.dates.length
            for (var k = 0; k < length; k++) {
              var d = new Date(eventSync.dates[k - deleted].timestamp);
              var userIndexOf = indexOfDatesArray(d, dates);
              if (userIndexOf == -1) {
                //user removed this date
                var users = eventSync.dates[k - deleted].users;
                var index = users.indexOf(user.$id);
                if (index >= 0) {
                  if (users.length > 1) {
                    eventSync.dates[k - deleted].users.splice(index, 1);
                  } else {
                    eventSync.dates.splice(k - deleted, 1);
                    deleted += 1;
                  }
                }
              } else {
                dates.splice(userIndexOf, 1);
                var users = eventSync.dates[k - deleted].users;
                if (users.indexOf(user.$id) == -1) {
                  eventSync.dates[k - deleted].users.push(user.$id);
                }
              }
            }
          }
          //console.log('removed:', angular.copy(eventSync.dates), (eventSync.dates || []).length);
          //console.log('try to add:', angular.copy(dates));
          if (dates.length > 0) {
            for (var z = 0; z < dates.length; z++) {
              eventSync.dates = eventSync.dates || [];
              var d = dates[z];
              var indexOf = indexOfDatesArray(d, eventSync.dates);
              if (indexOf == -1) {
                var str = valToDate(d.valueOf());
                eventSync.dates.push({
                  date: str,
                  timestamp: d.valueOf(),
                  users: [user.$id]
                });
              }
            }
          }
          //console.log('before save:', angular.copy(eventSync.dates), (eventSync.dates || []).length);
          eventSync.$save();
        }
      }, true);
    }

    var getTimeModel = function() {
      var user = $rootScope.user;
      if (user.dates) {
        for (var k in user.dates) {
          var d = user.dates[k];
          if (parseInt(d.date) == $scope.selectedDate) {
            $scope.currentDateModel = $rootScope.user.dates[k];
            return;
          }
        }
      }
      $scope.currentDateModel = null;
    }

    var updateCalendarDigest = function() {
      if(!$scope.$$phase) {
        $scope.$apply(function() {
          updateCalendar();
        });
      } else {
        updateCalendar();
      }
    }

    var updateCalendar = function() {
      var dates = eventSync.dates;
      $scope.currentEvent.title = eventSync.title;
      $scope.currentEvent.rejected = eventSync.rejected;
      if (dates) {
        var box = {};
        for (var k = 0; k < dates.length; k++) {
          var d = dates[k].timestamp;
          box[d] = dates[k];
        }
        var deleted = 0;
        for (var k = 0; k < $scope.currentEvent.dates.length; k++) {
          var index = k - deleted;
          var time = $scope.currentEvent.dates[index].timestamp;
          if (!box[time]) {
            $scope.currentEvent.dates.splice(index, 1);
            deleted += 1;
          } else {
            $scope.currentEvent.dates[index]['users'] = box[time].users;
            delete box[time];
          }
        }
        for (var k in box) {
          $scope.currentEvent.dates.push(box[k]);
        }

        var ar = [];
        var max = 0;
        var rejected = eventSync.rejected || [];
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
        $scope.currentEvent.dates = [];
        $scope.preferredDays = [];
      }
    }

    $scope.loading = true;
    eventSync.$loaded(function() {
      var user = Auth.getUser();
      $scope.loading = false;
      if (eventSync.rejected) {
        $scope.userRejected = eventSync.rejected.indexOf(user.$id) != -1;
      }
      $scope.userDates = getUserDates();
      startWatchUserDates();
      startWatchUserRejected();
      updateCalendarDigest();
      eventSync.$watch(updateCalendarDigest);
    });
  });

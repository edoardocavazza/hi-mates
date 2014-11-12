'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:hmCalendar
 * @description
 * # hmCalendar
 */
angular.module('himatesApp')
  .directive('hmCalendar', function () {
    return {
      restrict: 'A',
      scope: {
        dates: '=hmCalendar',
        disabled: '=hmCalendarDisabled',
        available: '=hmCalendarAvailable'
      },
      link: function(scope, element, attrs) {
        var lastSelected = null;
        var availableDates = [];

        if (!scope.dates) {
          scope.dates = [];
        }

        var use = attrs.hmCalendarType || 'date';
        if (scope.dates.length > 0) {
          var sample = scope.dates[0];
          var type = typeof sample;
          use = type.toLowerCase();
        }

        var removeDateAt = function(index) {
          scope.$apply(function() {
            scope.dates.splice(index, 1);
          });
        }

        var addDate = function(date) {
          date = new Date(date);
          scope.$apply(function() {
            if (use == 'date') {
              scope.dates.push(date);
            } else if (use == 'number') {
              scope.dates.push(date.valueOf());
            }
          });
        }

        var refrehDates = function() {
          element.multiDatesPicker('resetDates');
          if (scope.dates && scope.dates.length > 0) {
            var dates = scope.dates;
            var res = [];
            for (var k = 0; k < dates.length; k++) {
              var d = new Date(dates[k]);
              var time = d.valueOf();
              if (!availableDates || availableDates.length == 0 || availableDates.indexOf(time) != -1) {
                res.push(d);
              } else {
                scope.dates.splice(k, 1);
              }
            }
            if (res.length > 0) {
              element.multiDatesPicker('addDates', res);
            }
          }
        }

        element.multiDatesPicker({
          onSelect: function(d, ui) {
            if (element.attr('disabled') == 'disabled') {
              refrehDates();
              return;
            }
            var date = new Date(d);
            var time = date.valueOf();
            var dates = scope.dates || [];
            var found = false;
            for (var k = 0; k < dates.length; k++) {
              if (time == (new Date(dates[k])).valueOf()) {
                found = true;
                if (lastSelected == time) {
                  removeDateAt(k);
                  return;
                }
              }
            }
            if (!found) {
              addDate(date);
            } else {
              refrehDates();
            }
            lastSelected = time;
          },
          beforeShowDay: function(date) {
            if (availableDates && availableDates.length > 0) {
              var time = date.valueOf();
              if (availableDates.indexOf(time) == -1) {
                return [false, 'bad_date', 'This date is not selectable'];
              } else {
                return [true, 'good_date', 'This date is selectable'];
              }
            } else {
              return [true, 'good_date', 'This date is selectable'];
            }
          }
        });

        scope.$watch('available', function(val) {
          if (val) {
            availableDates = [];
            for (var k = 0; k < val.length; k++) {
              availableDates.push(new Date(val[k]).valueOf());
            }
            refrehDates();
          } else {
            availableDates = [];
          }
        })

        element.delegate('A', 'mousedown touchstart', function(ev) {
          element.find('A').attr('href', 'javascript:void(0)');
        });

        scope.$watch('disabled', function(val) {
          if (val) {
            element.attr('disabled', 'disabled');
            element.find('A').attr('disabled', 'disabled');
          } else {
            element.removeAttr('disabled');
            element.find('A').removeAttr('disabled');
          }
        });

        scope.$watch('dates', function(val) {
          refrehDates();
        }, true);
      }
    };
  });

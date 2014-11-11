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
        disabled: '=hmCalendarDisabled'
      },
      link: function(scope, element, attrs) {
        var lastSelected = null;

        var removeDateAt = function(index) {
          scope.$apply(function() {
            scope.dates.splice(index, 1);
          });
        }

        var addDate = function(date) {
          scope.$apply(function() {
            scope.dates.push(date);
          });
        }

        var refrehDates = function() {
          element.multiDatesPicker('resetDates');
          if (scope.dates && scope.dates.length > 0) {
            element.multiDatesPicker('addDates', scope.dates);
          }
        }

        element.multiDatesPicker({
          /*disabled: true,
          numberOfMonths: 2,
          minDate: 1,
          maxDate: 30*/
          onSelect: function(d, ui) {
            if (element.attr('disabled') == 'disabled') {
              refrehDates();
              return;
            }
            var date = new Date(d);
            var time = date.valueOf();
            var dates = scope.dates;
            var found = false;
            for (var k = 0; k < dates.length; k++) {
              if (time == dates[k].valueOf()) {
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
          /*beforeShowDay: function(date) {
            var day = date.getDay();
            if (day != 0 && day != 6) {
              return [true, 'good_date', 'This date is selectable'];
            } else {
              return [false, 'bad_date', 'This date is not selectable'];
            }
          }*/
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

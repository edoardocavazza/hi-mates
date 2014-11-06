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
    	restrict: 'E',
			scope: {
				dates: '=calDates'
			},
			link: function(scope, element, attrs, ngModel) {
				element.multiDatesPicker({
					disabled: true,
					numberOfMonths: 2,
					minDate: 1,
					maxDate: 30
				});

				scope.m = ngModel;

				scope.$watch('dates', function(val) {
					if (val) {
						element.multiDatesPicker('resetDates');
						var d = [];
						for (var k = 0; k < val.length; k++) {
							d.push(new Date(val[k].date));
						}
						if (d.length > 0) {
							element.multiDatesPicker('addDates', d);
						}
					}
				});
			}
		};
  });

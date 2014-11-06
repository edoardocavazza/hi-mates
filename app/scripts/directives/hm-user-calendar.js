'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:hmUserCalendar
 * @description
 * # hmUserCalendar
 */
angular.module('himatesApp')
  .directive('hmUserCalendar', function () {
    return {
			restrict: 'A',
			scope: {
				'model': '=hmUserCalendar',
				'disabled': '=hmDisabled'
			},
			link: function(scope, element, attrs) {
				var dates = [];
				var lastSelected = null;
				element.addClass('user-calendar');
				scope.$watch('disabled', function(val) {
					if (val) {
						element.attr('disabled', 'disabled');
					} else {
						element.removeAttr('disabled');
					}
				});

				element.multiDatesPicker({
					minDate: 1,
					maxDate: 30,
					onSelect: function(d, ui) {
						d = new Date(d);
						var ar = [];
						var v = d.valueOf();
						var cal = [];
						for (var k in dates) {
							var box = dates[k];
							if (box.date.valueOf() != v || v != lastSelected) {
								cal.push(box.date);
								ar.push({
									date: box.date.valueOf(),
									time: box.time || 'day'
								});
								if (v != lastSelected && box.date.valueOf() == v) {
									d = null;
								}
							} else {
								d = null;
							}
						}
						
						if (d || v != lastSelected) {
							if (d) {
								cal.push(d);
								ar.push({
									date: d.valueOf(),
									time: 'day'
								});
							}
							lastSelected = v;
							if (v != lastSelected) {
								scope.$emit('selectedDate', lastSelected, true);
							} else {
								scope.$emit('selectedDate', lastSelected);
							}
						} else {
							lastSelected = null;
						}

						if (cal.length) element.multiDatesPicker('addDates', cal);
						
						scope.$apply(function() {
							scope.model.dates = dates = ar;
						});
					},
					beforeShowDay: function(date) {
						var day = date.getDay();
						if (day != 0 && day != 6) {
							return [true, 'good_date', 'This date is selectable'];
						} else {
							return [false, 'bad_date', 'This date is not selectable'];
						}
					}
				});
				
				scope.$watch('model', function(val) {
					element.multiDatesPicker('resetDates');
					var d = [];
					var cal = [];
					if (val.dates) {
						for (var k = 0; k < val.dates.length; k++) {
							cal.push(new Date(val.dates[k].date));
							d.push({
								date: cal[cal.length-1],
								time: val.dates[k].time
							});
						}
						if (d.length > 0) {
							dates = d;
							element.multiDatesPicker('addDates', cal);
						}
					}
				});
			}
		};
  });

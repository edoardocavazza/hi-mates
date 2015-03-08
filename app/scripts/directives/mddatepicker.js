'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:mdDatePicker
 * @description
 * # mdDatePicker
 */

angular.module('himatesApp')

    .factory('mdColors', function($rootScope, $compile) {
        var directive = '<md-button aria-label="Fake element"></button>';

        var cache = {};

        return {

            getBackground: function(intent, el) {
                if (!el) {
                    el = $compile(directive)(scope);
                }
                el.addClass('md-' + intent + ' md-raised');
                return el.css('background-color');
            },

            getText: function(intent, el) {
                if (!el) {
                    el = $compile(directive)($rootScope.$new(true));
                }
                el.addClass('md-' + intent + ' md-raised');
                return el.css('color');
            },

            getStyle: function(intent) {
                if (cache[intent]) {
                    return cache[intent];
                }
                var el = $compile(directive)($rootScope.$new(true));
                $('body').append(el);
                var style = {
                    'color': this.getText(intent, el),
                    'background-color': this.getBackground(intent, el)
                }
                el.remove();
                cache[intent] = style;
                return style;
            }

        }
    })

    .directive('mdDatePicker', function(mdColors) {
        return {
            require: 'ngModel',
            restrict: 'AE',
            scope: {
                'ngDisabled': '=ngDisabled',
                'availableDates': '=mdAvailableDates'
            },
            templateUrl: 'partials/components/date-picker.html',
            link: function(scope, element, attrs, ngModel) {
                var activeLocale,
                    validDates = null,
                    options = {
                        locale: 'en',
                        selectYear: true,
                        selectMonth: true,
                        multiple: false
                    };

                scope.mdColors = mdColors;

                scope.previousMonth = function() {
                    scope.activeDate = scope.activeDate.subtract(1, 'month');
                    updateCalendar();
                };

                scope.nextMonth = function() {
                    scope.activeDate = scope.activeDate.add(1, 'month');
                    updateCalendar();
                };

                scope.isDateSelected = function(day) {
                    var selectedDate = day.toDate();
                    if (options.multiple) {
                        ngModel.$viewValue = ngModel.$viewValue || [];
                        for (var i = 0; i < ngModel.$viewValue.length; i++) {
                            var d = ngModel.$viewValue[i];
                            if (isSameDay(d, selectedDate)) {
                                return true;
                            }
                        }
                        return false;
                    } else {
                        return ngModel.$viewValue && selectedDate.valueOf() == ngModel.$viewValue.valueOf();
                    }
                }

                scope.select = function(day) {
                    var selectedDate = day.toDate();
                    if (options.multiple) {
                        ngModel.$viewValue = ngModel.$viewValue || [];
                        for (var i = 0; i < ngModel.$viewValue.length; i++) {
                            var d = ngModel.$viewValue[i];
                            if (isSameDay(d, selectedDate)) {
                                ngModel.$viewValue.splice(i, 1);
                                return;
                            }
                        }
                        ngModel.$viewValue.push(selectedDate);
                    } else {
                        ngModel.$viewValue = selectedDate;
                    }

                    updateCalendar();
                };

                scope.isDateValid = function(day) {
                    var selectedDate = day.toDate();
                    if (validDates) {
                        if (angular.isArray(validDates)) {
                            var dates = validDates;
                            for (var i = 0; i < dates.length; i++) {
                                var d = new Date(dates[i]);
                                if (isSameDay(d, selectedDate)) {
                                    return true;
                                }
                            }
                            return false;
                        } else if (angular.isFunction(validDates)) {
                            validDates.call(selectedDate, selectedDate);
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                }

                attrs.$observe('locale', function() {
                    update({
                        locale: checkLocale(attrs.locale)
                    }, false);
                });

                attrs.$observe('mdSelectYear', function() {
                    update({
                        selectYear: attrs.mdSelectYear !== 'no' ? true : false
                    }, false);
                });

                attrs.$observe('mdSelectMonth', function() {
                    update({
                        selectMonth: attrs.mdSelectMonth !== 'no' ? true : false
                    }, false);
                });

                attrs.$observe('multiple', function() {
                    update({
                        multiple: attrs.multiple !== 'no' ? true : false
                    }, false);
                });

                ngModel.$viewValue = ngModel.$viewValue;

                scope.$watch('ngDisabled', function(val) {
                    if (val) {
                        disable();
                    } else {
                        enable();
                    }
                });

                scope.$watch('model', function() {
                    update({
                        locale: checkLocale(attrs.locale)
                    }, true);
                }, true);

                scope.$watch('availableDates', function(val) {
                    setValidDates(val);
                });

                var isSameDay = function(d1, d2) {
                    return moment(d1).format('YYYY/M/D') === moment(d2).format('YYYY/M/D');
                }

                var update = function(opt, isNewModel) {
                    options = angular.extend(options, opt);
                    activeLocale = options.locale;
                    moment.locale(activeLocale);

                    if (angular.isDefined(ngModel.$viewValue)) {
                        if (angular.isDate(ngModel.$viewValue)) {
                            scope.activeDate = moment(ngModel.$viewValue);
                        } else if (angular.isArray(ngModel.$viewValue) && ngModel.$viewValue.length > 0) {
                            scope.activeDate = moment(ngModel.$viewValue[0]);
                        } else {
                            scope.activeDate = moment();
                        }
                    } else {
                        scope.activeDate = moment();
                    }

                    scope.moment = moment;

                    scope.selectYear = options.selectYear;
                    scope.selectMonth = options.selectMonth;

                    scope.days = [];
                    scope.months = [];
                    for (var y = 0; y < 12; y++) {
                        scope.months.push(moment.months('YYYY', y));
                    }
                    scope.daysOfWeek = [moment.weekdaysMin(1), moment.weekdaysMin(2), moment.weekdaysMin(3), moment.weekdaysMin(4), moment.weekdaysMin(5), moment.weekdaysMin(6), moment.weekdaysMin(0)];
                        
                    scope.years = [];

                    for (var y = moment().year() - 10; y <= moment().year() + 10; y++) {
                        scope.years.push(y);
                    }

                    scope.$watch(function() {
                        return scope.activeDate.toDate().valueOf();
                    }, function(val) {
                        scope.currentYear = moment(scope.activeDate || new Date()).year();
                        scope.currentMonth = moment(scope.activeDate || new Date()).month();
                    });

                    updateCalendar();
                };

                var setValidDates = function(values) {
                    validDates = values;
                }

                var disable = function() {
                    scope.disabled = true;
                }

                var enable = function() {
                    scope.disabled = false;
                }

                function updateCalendar() {
                    var days = [],
                        previousDay = angular.copy(scope.activeDate).date(0),
                        firstDayOfMonth = angular.copy(scope.activeDate).date(1),
                        lastDayOfMonth = angular.copy(firstDayOfMonth).endOf('month'),
                        maxDays = angular.copy(lastDayOfMonth).date();

                    scope.emptyFirstDays = [];            

                    for (var i = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; i > 0; i--) {
                        scope.emptyFirstDays.push({});
                    }

                    for (var j = 0; j < maxDays; j++) {
                        var date = angular.copy(previousDay.add(1, 'days'));
                        days.push(date);
                    }

                    scope.emptyLastDays = [];

                    for (var k = 7 - (lastDayOfMonth.day() === 0 ? 7 : lastDayOfMonth.day()); k > 0; k--) {
                        scope.emptyLastDays.push({});
                    }
                    
                    scope.days = days;
                }

                function checkLocale(locale) {
                    if (!locale) {
                        return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split("_")[0].split("-")[0] || 'en';
                    }

                    return locale;
                }

                update(checkLocale(attrs.locale));
            }
        };
    });
'use strict';

/**
 * @ngdoc filter
 * @name himatesApp.filter:orderFilter
 * @function
 * @description
 * # orderFilter
 * Filter in the himatesApp.
 */
angular.module('himatesApp')
  .filter('orderFilter', function ($filter) {
    var f = $filter('orderBy');

    var orderByDate = function(obj) {
      return f(obj, 'timestamp', false);
    }

    var orderByDay = function(obj) {
      return f(obj, 'users.length', true);
    }

    return function(obj, filter) {
      switch(filter) {
        case 'date':
          return orderByDate(obj);
          break;
        case 'day':
          return orderByDay(obj);
          break;
      }
      return obj;
    }
  });

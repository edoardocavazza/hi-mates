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
    var orderByDate = function(obj) {
			var res = [];
			for (var k in obj) {
				res.push(obj[k]);
			}
			var f = $filter('orderBy');
			return f(res, 'date', false);
		}

		var orderByDay = function(obj) {
			var res = [];
			for (var k in obj) {
				res.push(obj[k]);
			}
			var f = $filter('orderBy');
			return f(res, 'length', true);
		}

		var orderByPartial = function(obj) {
			var count = [];
			for (var k in obj) {
				var m = 0;
				var a = 0;
				var o = obj[k];
				for (var j in o.users) {
					var u = o.users[j];
					var t = u.time;
					switch (t) {
						case 'day':
							m++;
							a++;
							break;
						case 'morning':
							m++;
							break;
						case 'afternoon':
							a++;
							break;
					}
				}
				count.push({
					id: k,
					max: Math.max(m, a)
				})
			}
			var f = $filter('orderBy');
			var ordered = f(count, 'max', true);
			var res = [];
			for (var z in ordered) {
				res.push(obj[ordered[z].id]);
			}
			return res;
		}

		return function(obj, filter) {
			switch(filter) {
				case 'date':
					return orderByDate(obj);
					break;
				case 'day':
					return orderByDay(obj);
					break;
				case 'partial':
					return orderByPartial(obj);
					break;
			}
			return obj;
		}
  });

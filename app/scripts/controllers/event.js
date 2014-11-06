'use strict';

/**
 * @ngdoc function
 * @name himatesApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the himatesApp
 */
angular.module('himatesApp')
  .controller('EventCtrl', function ($scope, $rootScope, $http, $q, $firebase, $timeout) {
    var fbUrl = 'https://himates.firebaseio.com/';
		var rootRef = new Firebase(fbUrl);
		var sync = $firebase(rootRef);
		$scope.data = sync.$asObject();

		$scope.preferredDays = [];
		$scope.allSelectedDays = {};

		$scope.getRealName = function(user) {
			var user = user || $rootScope.user;
			if (user.twitter) {
				return user.twitter.displayName;
			}
			if (user.github) {
				return user.github.displayName;
			}
			if (user.facebook) {
				return user.facebook.displayName;
			}
			if (user.google) {
				return user.google.displayName;
			}
		}

		$scope.getAvatar = function(user) {
			var user = user || $rootScope.user;
			if (user.twitter) {
				return user.twitter.cachedUserProfile.profile_image_url;
			}
			if (user.github) {
				return user.github.cachedUserProfile.avatar_url;
			}
			if (user.facebook) {
				return user.facebook.cachedUserProfile.picture.data.url;
			}
			if (user.google) {
				return user.google.cachedUserProfile.picture;
			}
		}

		$scope.hasDates = function(u) {
			if (u && u.dates && u.dates.length > 0 && !u.rejected) {
				return 'has-dates';
			}
			if (u && u.rejected){
				return 'rejected';
			} 
			return '';
		}

		var addZero = function(no) {
			if (no < 10){
				return "0" + no;
			}  else {
				return no; 
			}
		}

		$scope.valToDate = function(v) {
			var d = new Date(parseInt(v));
			var ds  = [
				addZero(d.getDate()),
				addZero(d.getMonth() + 1),
				addZero(d.getFullYear())
			].join('/');
			return ds;
		}

		$scope.checkUserTime = function(u, v) {
			v = parseInt(v);
			for (var k in u.dates) {
				var s = new Date(u.dates[k].date);
				if (s.valueOf() == v && !u.rejected) {
					return u.dates[k].time;
				}
			}
			return false;
		}

		$scope.checkUserDate = function(u, v) {
			v = parseInt(v);
			for (var k in u.dates) {
				var s = new Date(u.dates[k].date);
				if (s.valueOf() == v && !u.rejected) {
					return true;
				}
			}
			return false;
		}

		$scope.getPreferencesNumber = function() {
			var n = 0;
			var users = $scope.data.users;
			for (var k in users) {
				var u = users[k];
				if (!u.rejected) {
					var d = u.dates || [];
					if (d.length > 0) {
						n++;
					}
				}
			}
			if (n == 0) {
				return 'Nobody has';
			} else if (n == 1) {
				return 'Just 1 person has';
			} 

			return n + ' persons have';
		} 

		$scope.getRejectedNumber = function() {
			var n = 0;
			if ($scope.data && $scope.data.users) {
				for (var k in $scope.data.users) {
					var u = $scope.data.users[k];
					if (u.rejected) {
						n++;
					}
				}
			}
			if (n == 0) {
				return false;
			} else if (n == 1) {
				return '1 person';
			}
			return n + ' persons';
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

		var updateCals = function() {
			var convert = {};
			var max = 0;
			var users = $scope.data.users;
			for (var k in users) {
				var u = users[k];
				var d = u.dates || [];

				var datesAr = [];
				if (!u.rejected) {
					for (var j in d) {
						datesAr.push(d[j].date);
					}
				} else {
					d = [];
				}
				for (var j in $scope.allSelectedDays) {
					var key = parseInt($scope.allSelectedDays[j].date);
					var l = 0;
					for (var z in $scope.allSelectedDays[j].users) {
						var data = $scope.allSelectedDays[j].users[z];
						if (data.user) {
							if (data.user.uid == u.uid && datesAr.indexOf(key) == -1) {
								$scope.allSelectedDays[j].length -= 1;
								delete $scope.allSelectedDays[j].users[z];
							} else {
								l++;
							}
						}
					}
					if (l == 0) {
						delete $scope.allSelectedDays[j];
					}
				}
				for (var s = 0; s < d.length; s++) {
					var v = new Date(d[s].date).valueOf();
					convert[v] = d[s];
					var n = $scope.allSelectedDays[v] || { users: {}, length: 0 };
					var found = false;
					for (var j in n.users) {
						if (n.users[j].user  && n.users[j].user.uid == u.uid) {
							$scope.allSelectedDays[v].users[u.uid].time = d[s].time;
							found = true;
						}
					}
					if (!found) {
						$scope.allSelectedDays[v] = $scope.allSelectedDays[v] || { users: {}, length: 0 };
						if (!$scope.allSelectedDays[v].users[u.uid]) {
							$scope.allSelectedDays[v].length += 1;
						}
						$scope.allSelectedDays[v].users[u.uid] = {
							user: u,
							time: d[s].time
						}
					}
					$scope.allSelectedDays[v].date = v;
					if ($scope.allSelectedDays[v].length > max) {
						max = $scope.allSelectedDays[v].length;
					}
				}
			}
			$scope.preferredDays = [];
			for (var k in $scope.allSelectedDays) {
				if ($scope.allSelectedDays[k].length == max && convert[k]) {
					$scope.preferredDays.push(convert[k]);
				}
			}
			getTimeModel();
		}

		$scope.userDates = {};
		$rootScope.loading = true;
		$scope.data.$loaded(function() {
			$rootScope.loading = false;
			if (!$scope.data.users) {
				$scope.data.users = {};
			}

			if (!$scope.data.users[$rootScope.user.uid]) {
				$scope.data.users[$rootScope.user.uid] = $rootScope.user;
				$scope.data.$save();
			} else {
				$rootScope.user = $scope.data.users[$rootScope.user.uid];
			}

			if ($rootScope.user['rejected'] == null || $rootScope.user['rejected'] == undefined) {
				$rootScope.user['rejected'] = false;
			}

			$scope.$watch('user', function() {
				$scope.data.users[$rootScope.user.uid] = $rootScope.user;
				$scope.data.$save();
			});

			$scope.$watch('user.rejected', function() {
				$scope.data.users[$rootScope.user.uid] = $rootScope.user;
				$scope.data.$save();
			});

			$scope.$watch('user.dates', function() {
				$scope.data.users[$rootScope.user.uid] = $rootScope.user;
				$scope.data.$save();
			});

			$rootScope.loading = false;
			$(window).scrollTop(0);

			$scope.selectedDate = null;

			$scope.currentDateModel = null;

			$scope.$watch('currentDateModel.time', function(val) {
				if (val && $scope.selectedDate) {
					var user = $rootScope.user;
					if (user.dates) {
						for (var k in user.dates) {
							var d = user.dates[k];
							if (parseInt(d.date) == $scope.selectedDate) {
								$rootScope.user.dates[k].time = val;
								$scope.currentDateModel = $rootScope.user.dates[k];
								$scope.data.users[$rootScope.user.uid] = $rootScope.user;
								$scope.data.$save();
								updateCals();
								return;
							}
						}
					}
				}
			});

			$scope.$on('selectedDate', function(listener, args, force) {
				$scope.selectedDate = args;
				if (force) {
					getTimeModel();
				}
			});
			
			$scope.data.$watch(function() {
				updateCals();
			}, true);
		});
  });

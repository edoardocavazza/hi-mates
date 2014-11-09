'use strict';

/**
 * @ngdoc service
 * @name himatesApp.Auth
 * @description
 * # Auth
 * Factory in the himatesApp.
 */
angular.module('himatesApp')
  .factory('Auth', function ($rootScope, $q, $firebase) {
    var fbUrl = 'https://himates.firebaseio.com/users';
    var rootRef = new Firebase(fbUrl);
    var user = $rootScope.user = rootRef.getAuth();
    var callbacks = {};
    var service = this;

    // Public API here
    return {
      $on: function(evtName, fn) {
        var c = callbacks[evtName] || [];
        c.push(fn);
        callbacks[evtName] = c;
      },
      $trigger: function(evtName, args) {
        var c = callbacks[evtName] || [];
        for (var k in c) {
          var fn = c[k];
          fn.call(service, args);
        }
      },
      login: function (provider) {
        var deferred = $q.defer();
        rootRef.authWithOAuthPopup(provider, function (err, user) {
          if (err) {
            deferred.reject(err);
          }
          if (user) {
            $rootScope.$apply(function() {
              $rootScope.user = user;
            });
            deferred.resolve(user);
          }
        });
        return deferred.promise;
      },
      logout: function(provider) {
        var deferred = $q.defer();
        rootRef.offAuth(function(err) {
          if (err) {
            deferred.reject(err);
          }
          if (user) {
            $rootScope.$apply(function() {
              $rootScope.user = null;
            });
            deferred.resolve(user);
          }
        });
        return deferred.promise;
      },
      isLogged: function() {
        return user ? true : false;
      } 
    };
  });

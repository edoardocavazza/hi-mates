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
    var fbUrl = 'https://himates.firebaseio.com/';
    var rootRef = new Firebase(fbUrl);
    $rootScope.user = rootRef.getAuth();
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
        var service = this;
        var c = callbacks[evtName] || [];
        for (var k in c) {
          var fn = c[k];
          fn.apply(service, args);
        }
      },
      login: function (provider) {
        var service = this;
        var old = $rootScope.user;
        var deferred = $q.defer();
        rootRef.authWithOAuthPopup(provider, function (err, user) {
          if (err) {
            deferred.reject(err);
          }
          if (user) {
            $rootScope.$apply(function() {
              $rootScope.user = user;
              service.$trigger('login', [user, old]);
            });
            deferred.resolve(user);
          }
        });
        return deferred.promise;
      },
      logout: function(provider) {
        var service = this;
        var deferred = $q.defer();
        rootRef.offAuth(function(err) {
          console.log(err);
          if (err) {
            deferred.reject(err);
          }
          deferred.resolve();
        });
        $rootScope.user = null;
        localStorage.removeItem('firebase:session::himates');
        service.$trigger('logout');
        return deferred.promise;
      },
      isLogged: function() {
        return $rootScope.user ? true : false;
      },
      getUser: function() {
        return $rootScope.user;
      }
    };
  });

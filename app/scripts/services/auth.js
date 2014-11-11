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
    $rootScope.user = null;
    var fbUrl = 'https://himates.firebaseio.com/';
    var rootRef = new Firebase(fbUrl);
    var usersListRef = new Firebase(fbUrl + 'users');
    var userMapsRef = new Firebase(fbUrl + 'user-mappings');
    var userRef = null;
    var sync = null;

    var getUser = function(auth) {
      var dfr = $q.defer();
      if (auth) {
        var provider = auth.provider;
        var uid = auth.uid;
        var providerList = userMapsRef.child(provider);
        var list = $firebase(providerList).$asObject();
        list.$loaded(function() {
          var userid = list[uid] || null;
          if (!userid) {
            dfr.reject();
          } else {
            var res = $firebase(usersListRef.child(userid)).$asObject();
            res.$loaded(function() {
              dfr.resolve(res);
            });
          }
        })
      } else {
        dfr.reject();
      }
      return dfr.promise;
    }

    var createUser = function(data) {
      var dfr = $q.defer();
      if (data) {
        var usersList = $firebase(usersListRef).$asArray();
        usersList.$loaded(function() {
          var id = 'mate:' + usersList.length;
          var userRef = new Firebase(fbUrl + 'users/' + id);
          var user = $firebase(userRef).$asObject();
          user.$id = id;
          user[data.provider] = data[data.provider];
          user.$save();
          dfr.resolve(user);
        });
      } else {
        dfr.reject();
      }

      return dfr.promise;
    }

    var callbacks = {};
    var setup = false;

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
      setup: function() {
        var auth = rootRef.getAuth();
        var service = this;
        if (auth) {
          getUser(auth).then(function(user) {
            $rootScope.user = user;
            setup = true;
            service.$trigger('loaded', [user]);
          }, function() {
            setup = true;
            service.$trigger('loaded');
          });
        } else {
          setup = true;
          service.$trigger('loaded');
        }
      },
      isSettedUp: function() {
        return setup;
      },
      login: function (provider) {
        var service = this;
        var old = $rootScope.user;
        var deferred = $q.defer();
        rootRef.authWithOAuthPopup(provider, function (err, user) {
          if (err) {
            if (err.code === 'TRANSPORT_UNAVAILABLE') {
              // fall-back to browser redirects, and pick up the session
              // automatically when we come back to the origin page
              rootRef.authWithOAuthRedirect(provider, function(err, authData) {
                deferred.reject(err);
              });
            }
          }
          if (user) {
            user[provider]['uid'] = user.uid;
            if ($rootScope.user) {
              $rootScope.$apply(function() {
                var ref = userMapsRef.child(provider);
                var mapped = {};
                mapped[user.uid] = $rootScope.user.$id;
                ref.set(mapped);
                $rootScope.user[provider] = user[provider];
                $rootScope.user.$save();
                deferred.resolve($rootScope.user);
              });
              service.$trigger('profile:add', [user]);
            } else {
              getUser(user).then(function(u) {
                $rootScope.user = u;
                $rootScope.user[provider] = user[provider];
                $rootScope.user.$save();
                deferred.resolve($rootScope.user);
                service.$trigger('login', [user]);
              }, function() {
                createUser(user)
                  .then(function(newUser) {
                    $rootScope.user = newUser;
                    var ref = userMapsRef.child(provider);
                    var mapped = {};
                    mapped[user.uid] = $rootScope.user.$id;
                    ref.set(mapped);
                    deferred.resolve($rootScope.user);
                    service.$trigger('login', [user, old]);
                  });
              });
            }
          }
        });
        return deferred.promise;
      },
      logout: function() {
        var service = this;
        rootRef.unauth();
        sync = null;
        $rootScope.user = null;
        service.$trigger('logout');
      },
      logoutProvider: function(provider) {
        var dfr = $q.defer();
        delete $rootScope.user[provider];
        $rootScope.user.$save();
      },
      isLogged: function() {
        return $rootScope.user ? true : false;
      },
      getUser: function() {
        return $rootScope.user;
      }
    };
  });

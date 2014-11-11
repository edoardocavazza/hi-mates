'use strict';

/**
 * @ngdoc overview
 * @name himatesApp
 * @description
 * # himatesApp
 *
 * Main module of the application.
 */
angular
  .module('himatesApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'firebase'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'partials/dashboard.html',
        data: {
          authenticate: true
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/auth/login.html'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/auth/profile.html',
        data: {
          authenticate: true
        }
      })
      .state('event', {
        abstract: true,
        templateUrl: 'partials/events/event.html',
        data: {
          authenticate: true
        }
      })
      .state('event.create', {
        url: '/event/new',
        templateUrl: 'partials/events/new.html',
        data: {
          authenticate: true
        }
      })
      .state('event.view', {
        url: '/event/view/:eventId',
        templateUrl: 'partials/events/view.html',
        data: {
          authenticate: true
        }
      });
  })
  .run(function($rootScope, $location, $state, $timeout, Auth) {
    var lastPath = null;
    var isPreloadTimeEnded = false;
    var isAuthLoaded = false;
    $rootScope.loading = true;
    $rootScope.showButtons = false;
    $timeout(function() {
      isPreloadTimeEnded = true;
      if (isAuthLoaded) {
        $rootScope.loading = false;
        $timeout(function() {
          $rootScope.showButtons = true;
        }, 1000);
      }
    }, 2000);

    Auth.$on('loaded', function(user) {
      $state.transitionTo('dashboard');
      isAuthLoaded = true;
      if (isPreloadTimeEnded) {
        $rootScope.loading = false;
        $timeout(function() {
          $rootScope.showButtons = true;
        }, 1000);
      }
    });

    Auth.$on('login', function(user, previous) {
      if (!previous) {
        $state.transitionTo(lastPath ? lastPath.name : 'dashboard');
      }
    });

    Auth.$on('logout', function() {
      $state.transitionTo('login');
    });

    Auth.setup();

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $(window).scrollTop(0);
      if (Auth.isLogged() && toState.name == 'login') {
        lastPath = null;
        $state.transitionTo('dashboard');
        event.preventDefault();
      }
      if (toState.data && toState.data.authenticate && toState.name != 'login' && !Auth.isLogged()) {
        lastPath = toState;
        // User isn’t authenticated
        $state.transitionTo('login');
        event.preventDefault();
      }
    });

    $rootScope.getRealName = function(user) {
      var user = user || $rootScope.user;
      if (!user) {
        return '';
      }
      if (user.facebook) {
        return user.facebook.displayName;
      }
      if (user.google) {
        return user.google.displayName;
      }
      if (user.twitter) {
        return user.twitter.displayName;
      }
      if (user.github) {
        return user.github.displayName;
      }
    }

    $rootScope.getAvatar = function(user) {
      var user = user || $rootScope.user;
      if (!user) {
        return '';
      }
      if (user.facebook) {
        return user.facebook.cachedUserProfile.picture.data.url;
      }
      if (user.twitter) {
        return user.twitter.cachedUserProfile.profile_image_url;
      }
      if (user.google) {
        return user.google.cachedUserProfile.picture;
      }
      if (user.github) {
        return user.github.cachedUserProfile.avatar_url;
      }
    }

    $rootScope.logout = function() {
      return Auth.logout();
    }

  });

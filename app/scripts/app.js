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
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'ui.router',
    'firebase'
  ])

  .value('fbURL', 'https://himates.firebaseio.com')

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
        url: '/profile/:profileId',
        templateUrl: 'partials/auth/profile.html',
        data: {
          authenticate: true
        }
      })
      .state('me', {
        url: '/me',
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
        templateUrl: 'partials/events/edit.html',
        data: {
          authenticate: true
        }
      })
      .state('event.edit', {
        url: '/event/edit/:eventId',
        templateUrl: 'partials/events/edit.html',
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
  .run(function($rootScope, $location, $state, $timeout, Auth, AppServices) {
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
      if (lastPath) {
        $location.path(lastPath);
      } else {
        $state.transitionTo('dashboard');
      }
      isAuthLoaded = true;
      if (isPreloadTimeEnded) {
        $rootScope.loading = false;
        $timeout(function() {
          $rootScope.showButtons = true;
        }, 1000);
      }
    });

    Auth.$on('login', function(user, previous) {
      $state.transitionTo(lastPath ? lastPath : 'dashboard');
    });

    Auth.$on('logout', function() {
      $state.transitionTo('login');
    });

    Auth.setup();

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      $(window).scrollTop(0);
      if (Auth.isLogged() && toState.name == 'login') {
        $state.transitionTo('dashboard');
        event.preventDefault();
      }
      if (toState.data && toState.data.authenticate && toState.name != 'login' && !Auth.isLogged()) {
        lastPath = $location.path();
        // User isn’t authenticated
        $state.transitionTo('login');
        event.preventDefault();
      }
    });

    $rootScope.navigate = function(path) {
      $location.path(path);
    }

    $rootScope.getRealName = function(user) {
      return AppServices.getRealName(user || $rootScope.user);
    }

    $rootScope.getAvatar = function(user) {
      return AppServices.getAvatar(user || $rootScope.user);
    }

    $rootScope.getUserId = function(user) {
      return AppServices.getUserId(user || $rootScope.user);
    }

    $rootScope.logout = function() {
      return Auth.logout();
    }

  });

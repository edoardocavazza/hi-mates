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
        templateUrl: 'partials/login.html'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/profile.html'
      })
      .state('event', {
        url: '/event',
        templateUrl: 'partials/event.html',
        data: {
          authenticate: true
        }
      });
  })
  .run(function($rootScope, $state, $timeout, Auth) {
    $rootScope.loading = true;
    $rootScope.showButtons = false;
    $timeout(function() {
      $rootScope.loading = false;
      $timeout(function() {
        $rootScope.showButtons = true;
      }, 1000);
    }, 2000);

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (Auth.isLogged() && toState.name == 'login') {
        $state.transitionTo('dashboard');
        event.preventDefault();
      }
      if (toState.data && toState.data.authenticate && !Auth.isLogged()) {
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

    $rootScope.getAvatar = function(user) {
      var user = user || $rootScope.user;
      if (!user) {
        return '';
      }
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

  });

'use strict';

/**
 * @ngdoc service
 * @name himatesApp.Modal
 * @description
 * # Modal
 * Service in the himatesApp.
 */
angular.module('himatesApp')
  .service('Modal', function Modal($q, $compile, $interpolate, $animate) {
    return {
      show: function(scope, attrs, options) {
        var dfr = $q.defer();
        var defaults = {
          directive: 'modal'
        }
        var element;
        var hideFn = function() {
          element.removeClass('show');
          $animate.leave(element);
        }
        var defaultScope = {
          type: 'alert',
          position: function() {
            return 'north';
          },
          message: '',
          content: null,
          cancelLabel: 'cancel',
          okLabel: 'ok',
          cancel: function() {
            hideFn();
            dfr.reject();
          },
          ok: function() {
            dfr.resolve();
          },
          modalData: {}
        }
        options = angular.extend(options || {}, defaults);
        attrs = angular.extend(defaultScope, attrs);
        scope = angular.extend(scope, attrs);
        element = $compile('<' + options.directive + '></' + options.directive + '>')(scope);
        scope.modalData.element = element;
        $animate.enter(element, $(document.body)).then(function() {
          element.addClass('show');
        });
        return {
          promise: dfr.promise,
          hide: hideFn
        };
      }
  }
  });

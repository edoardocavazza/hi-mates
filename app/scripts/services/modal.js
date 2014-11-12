'use strict';

/**
 * @ngdoc service
 * @name himatesApp.Modal
 * @description
 * # Modal
 * Service in the himatesApp.
 */
angular.module('himatesApp')
  .service('Modal', function Modal($rootScope, $q, $compile, $interpolate, $animate, $timeout) {
    return {
      show: function(parentScope, attrs, options) {
        var dfr = $q.defer();
        var defaults = {
          directive: 'hm-modal'
        }
        var element;
        var scope = parentScope.$new(true, parentScope);
        var hideFn = function() {
          $animate.leave(element);
        }
        var defaultScope = {
          type: 'alert',
          position: function() {
            return 'north';
          },
          message: '',
          content: null,
          cancelLabel: null,
          okLabel: 'ok',
          autoClose: null,
          cancel: function() {
            hideFn();
            dfr.reject();
          },
          ok: function() {
            if (attrs.autoClose) {
              hideFn();
            }
            dfr.resolve();
          }
        }
        options = angular.extend(options || {}, defaults);
        attrs = angular.extend(defaultScope, attrs);
        scope.modal = attrs;
        if (attrs.autoClose) {
          $timeout(function() {
            scope.modal.ok();
          }, attrs.autoClose);
        }
        element = $compile('<' + options.directive + '></' + options.directive + '>')(scope);
        $animate.enter(element, $(document.body));
        return {
          element: element,
          promise: dfr.promise,
          hide: hideFn
        };
      }
  }
  });

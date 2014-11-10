'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:modal
 * @description
 * # modal
 */
angular.module('himatesApp')
  .directive('modal', function () {
    return {
      restrict: 'E',
      replace: true,
      template: ' <div class="modalMessage" ng-class="type" ng-cloak>' +
              '<div class="modalMessagecontent">' + 
                '<div class="message-scroller">' +
                  '<p ng-bind-html="::message"></p>' +
                  '<div ng-include="::content"></div>' +
                '</div>' + 
                '<fieldset class="commands">' +
                  '<md-button md-theme="red" class="md-primary" id="cancel-button" ng-if="type == \'confirm\'" tabindex="1000" data-cancel="" ng-click="cancel($event, modalData)">{{ ::cancelLabel }}</md-button>' +
                  '<md-button md-theme="green" class="md-primary" id="ok-button" tabindex="1001" autofocus data-ok="" ng-click="ok($event, modalData)">{{ ::okLabel }}</md-button>' +
                '</fieldset>' +
              '</div>' +
            '</div>'
    }
  });

'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:hmModal
 * @restrict E

 * @description
 *
 * `hmModal` is a directive that includes the template of a modal message dialog.
 *
 * @animations
 * enter - animation is used to bring new content into the browser.
 * leave - animation is used to animate existing content away.
 *
 * @scope
 *
 * @example
    <div class="modalMessage" ng-class="confirm" ng-cloak>
      <div class="modalMessagecontent">
        <div class="message-scroller">
          <p>Do you really want to leave this page?</p>
        </div>
        <fieldset class="commands">
          <md-button md-theme="red" class="md-primary" id="cancel-button" tabindex="1000" data-cancel="" ng-click="modal.cancel($event)" aria-label="cancel">cancel</md-button>
          <md-button md-theme="green" class="md-primary" id="ok-button" tabindex="1001" autofocus data-ok="" ng-click="modal.ok($event)" aria-label="yes">yes</md-button>
        </fieldset>
      </div>
    </div>
 */
angular.module('himatesApp')
  .directive('hmModal', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template: ' <div class="modalMessage" ng-class="modal.type" ng-cloak>' +
              '<div class="modalMessagecontent">' + 
                '<div class="message-scroller">' +
                  '<p ng-bind-html="modal.message"></p>' +
                  '<div ng-include="modal.content"></div>' +
                '</div>' + 
                '<fieldset class="commands">' +
                  '<md-button md-theme="red" class="md-primary" id="cancel-button" ng-if="modal.cancelLabel" tabindex="1000" data-cancel="" ng-click="modal.cancel($event)" aria-label="{{ modal.cancelLabel }}">{{ modal.cancelLabel }}</md-button>' +
                  '<md-button md-theme="green" class="md-primary" id="ok-button" tabindex="1001" autofocus data-ok="" ng-click="modal.ok($event)" aria-label="{{ modal.okLabel }}">{{ modal.okLabel }}</md-button>' +
                '</fieldset>' +
              '</div>' +
            '</div>'
    }
  });

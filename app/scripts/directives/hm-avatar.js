'use strict';

 /**
 * @ngdoc directive
 * @name himatesApp.directive:hmAvatar
 * @restrict C
 *
 * @description
 *
 * `hmAvatar` is a directive that handle avatar image sizes.
 *
 * @example
    <img title="Albert Einstein" class="hm-avatar" draggable="false" src="http://m.c.lnkd.licdn.com/mpr/mpr/p/5/005/067/3b6/379aa17.jpg" />
 */
angular.module('himatesApp')
  .directive('hmAvatar', function () {
    return {
      restrict: 'C',
      link: function postLink(scope, element, attrs) {
        var img = element[0];
        var dim = function() {
        	if (img.naturalWidth > img.naturalHeight) {
        		element.removeClass('square portrait').addClass('landscape');
        	} else if (img.naturalWidth < img.naturalHeight) {
        		element.removeClass('square landscape').addClass('portrait');
        	} else {
        		element.removeClass('landscape portrait').addClass('square');
        	}
        }
        if (img.complete) {
        	dim();
        } else if (img.src) {
	        img.onload = function() {
	        	dim();
	       	}
	      }
        attrs.$observe('ngSrc', function(val) {
          if (val) {
            img.onload = function() {
              dim();
            }
            dim();
          }
        })
      }
    };
  });

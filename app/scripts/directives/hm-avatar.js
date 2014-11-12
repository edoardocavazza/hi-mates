'use strict';

/**
 * @ngdoc directive
 * @name himatesApp.directive:hmAvatar
 * @description
 * # img
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

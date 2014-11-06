'use strict';

describe('Directive: hmUserCalendar', function () {

  // load the directive's module
  beforeEach(module('himatesApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hm-user-calendar></hm-user-calendar>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the hmUserCalendar directive');
  }));
});

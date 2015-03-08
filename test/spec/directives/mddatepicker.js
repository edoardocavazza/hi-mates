'use strict';

describe('Directive: mdDatePicker', function () {

  // load the directive's module
  beforeEach(module('himatesApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<md-date-picker></md-date-picker>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the mdDatePicker directive');
  }));
});

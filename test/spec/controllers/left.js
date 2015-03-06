'use strict';

describe('Controller: LeftctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('himatesApp'));

  var LeftctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LeftctrlCtrl = $controller('LeftctrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

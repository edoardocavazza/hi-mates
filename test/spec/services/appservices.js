'use strict';

describe('Service: AppServices', function () {

  // load the service's module
  beforeEach(module('himatesApp'));

  // instantiate service
  var AppServices;
  beforeEach(inject(function (_AppServices_) {
    AppServices = _AppServices_;
  }));

  it('should do something', function () {
    expect(!!AppServices).toBe(true);
  });

});

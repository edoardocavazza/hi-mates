'use strict';

describe('Service: EventHandler', function () {

  // load the service's module
  beforeEach(module('himatesApp'));

  // instantiate service
  var EventHandler;
  beforeEach(inject(function (_EventHandler_) {
    EventHandler = _EventHandler_;
  }));

  it('should do something', function () {
    expect(!!EventHandler).toBe(true);
  });

});

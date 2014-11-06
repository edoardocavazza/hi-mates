'use strict';

describe('Filter: orderFilter', function () {

  // load the filter's module
  beforeEach(module('himatesApp'));

  // initialize a new instance of the filter before each test
  var orderFilter;
  beforeEach(inject(function ($filter) {
    orderFilter = $filter('orderFilter');
  }));

  it('should return the input prefixed with "orderFilter filter:"', function () {
    var text = 'angularjs';
    expect(orderFilter(text)).toBe('orderFilter filter: ' + text);
  });

});

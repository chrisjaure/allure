/*global describe, it, expect, jasmine */

describe('parseMd', function () {

	var parseMd = require('../src/parseMd');

	it('should return an array', function() {
		var result = parseMd(__dirname + '/fixture/basic.md');
		expect(result).toEqual(jasmine.any(Array));
	});

	it('should set a title', function () {
		var result = parseMd(__dirname + '/fixture/basic.md');
		expect(result[0].title).toEqual('component');
	});

});
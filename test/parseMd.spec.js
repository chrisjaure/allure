/*global describe, it, expect, jasmine */

describe('parseMd', function () {

	var parseMd = require('../src/parseMd');

	it('should return an array', function() {
		var result = parseMd(__dirname + '/fixture/basic.md');
		expect(result).toEqual(jasmine.any(Array));
	});

	it('should set a title', function() {
		var result = parseMd(__dirname + '/fixture/basic.md');
		expect(result[0].title).toEqual('component');
	});

	it('should accept an array of files', function() {
		var result = parseMd([__dirname + '/fixture/basic.md']);
		expect(result[0].title).toEqual('component');
	});

	it('should copy script to scriptRaw', function() {
		var result = parseMd([__dirname + '/fixture/basic.md']);
		expect(result[0].scriptRaw).toEqual(result[0].script);
		expect(result[0].scriptRaw).not.toBe(result[0].script);
	});

	it('should copy style to styleRaw', function() {
		var result = parseMd([__dirname + '/fixture/basic.md']);
		expect(result[0].styleRaw).toEqual(result[0].style);
		expect(result[0].styleRaw).not.toBe(result[0].style);
	});

	it('should copy markup to markupRaw', function() {
		var result = parseMd([__dirname + '/fixture/basic.md']);
		expect(result[0].markupRaw).toEqual(result[0].markup);
		expect(result[0].markupRaw).not.toBe(result[0].markup);
	});

});
/*global describe, it, expect, beforeEach, jasmine */

var collect = require('../src/plugins/collect');

describe('plugin.collect', function() {

	var fileConfs;

	beforeEach(function() {
		fileConfs = [
			{ nested: { property: ['value'] } },
			{ nested: { property: ['value2'] } }
		];
	});

	it('should return a function', function() {
		var fn = collect('', function() {});
		expect(fn).toEqual(jasmine.any(Function));
	});

	it('should concat collection with matches', function() {
		var cb = jasmine.createSpy('callback');
		var fn = collect('nested.property', cb);
		fn(fileConfs);
		expect(cb).toHaveBeenCalledWith(['value', 'value2']);
	});

	it('should make the cb async if the arity is 2', function() {
		var cb = function(collection, done) {
			expect(done).toBe('done');
		};
		var fn = collect('nested.property', cb);
		fn(fileConfs, 'done');
	});

	it('should bind context', function() {
		var context = { context: '' };
		var cb = function() {
			expect(this).toBe(context);
		};
		var fn = collect('nested.property', cb);
		fn.call(context, fileConfs);
	});

});
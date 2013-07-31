/*global describe, it, expect, beforeEach, jasmine */

var assets = require('../src/plugins/assets');

describe('plugin.assets', function() {

	var fileConfs;

	beforeEach(function() {
		fileConfs = [
			{ assets: { js: ['value'] } },
			{ assets: { css: ['value2'] } }
		];
	});

	it('should return a function', function() {
		var fn = assets();
		expect(fn).toEqual(jasmine.any(Function));
	});

	it('should add a script tag for each js', function() {
		var context = jasmine.createSpyObj('this', ['before']);
		var fn = assets();
		fn.call(context, fileConfs);
		expect(context.before).toHaveBeenCalledWith('<script src="value" type="text/javascript"></script>');
	});

	it('should add a link tag for each css', function() {
		var context = jasmine.createSpyObj('this', ['before']);
		var fn = assets();
		fn.call(context, fileConfs);
		expect(context.before).toHaveBeenCalledWith('<link href="value2" rel="stylesheet" />');
	});

});
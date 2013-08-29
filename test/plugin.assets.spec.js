/*global describe, it, expect, beforeEach, jasmine */

var assets = require('../src/plugins/assets');

describe('plugin.assets', function() {

	var fileConfs, context, fn;

	beforeEach(function() {
		fileConfs = [
			{ assets: { js: ['value'] } },
			{ assets: { css: ['value2'] } }
		];
		context = jasmine.createSpyObj('this', ['before']);
		context.locals = function() {
			return [];
		};
		fn = assets();
	});

	it('should return a function', function() {
		expect(fn).toEqual(jasmine.any(Function));
	});

	it('should add a script tag for each js', function() {
		fn.call(context, fileConfs);
		expect(context.before).toHaveBeenCalledWith('<script src="value" type="text/javascript"></script>');
	});

	it('should add a link tag for each css', function() {
		fn.call(context, fileConfs);
		expect(context.before).toHaveBeenCalledWith('<link href="value2" rel="stylesheet" />');
	});

	it('should not add duplicate assets', function() {
		context.locals = function() {
			return [
				'<script src="value" type="text/javascript"></script>',
				'<link href="value2" rel="stylesheet" />'
			];
		};
		fn.call(context, fileConfs);
		expect(context.before).not.toHaveBeenCalled();
	});

});
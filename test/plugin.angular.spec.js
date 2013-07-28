/*global describe, it, expect, jasmine, beforeEach */

var angular = require('../src/plugins/angular');

describe('plugin.angular', function() {

	var fileConfs, context;

	beforeEach(function() {
		fileConfs = [
			{ angular: ['test'] },
			{ angular: ['test2', 'test3'] }
		];

		context = {
			before: jasmine.createSpy('before')
		};
	});

	it('should return a function', function() {
		var fn = angular();
		expect(fn).toEqual(jasmine.any(Function));
	});

	it('should add an angular module that lists the others as dependencies', function() {
		var fn = angular();
		fn.call(context, fileConfs);
		expect(context.before).toHaveBeenCalledWith(
			'<script>angular.module("Allure", ["test","test2","test3"]);</script>'
		);
	});

});
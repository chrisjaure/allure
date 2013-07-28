/*global describe, it, expect, beforeEach, jasmine */

var collect = require('../src/plugins/collect');

describe('plugin.collect', function() {

	var fileConf, context;

	beforeEach(function() {
		fileConf = {
			nested: {
				property: ['value']
			}
		};

		context = {
			locals: jasmine.createSpy('locals')
		};
	});

	it('should return the plugin array signature', function() {
		var arr = collect('nested.property', 'prop');
		expect(arr).toEqual(jasmine.any(Array));
		expect(arr[0]).toEqual('nested.property');
		expect(arr[1]).toEqual(jasmine.any(Function));
		expect(arr[1].length).toEqual(1);
	});

	it('should concat collection with matches', function() {
		collect('nested.property', 'prop')[1].call(context, fileConf);
		expect(context.locals).toHaveBeenCalledWith('prop', fileConf.nested.property);
	});

});
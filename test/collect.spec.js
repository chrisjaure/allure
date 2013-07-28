/*global describe, it, expect, beforeEach, jasmine */

var collect = require('../src/plugins/collect');

describe('collect', function() {

	var fileConf, globalConf;

	beforeEach(function() {
		fileConf = {
			nested: {
				property: ['value']
			}
		};
		globalConf = {};
	});

	it('should return the plugin array signature', function() {
		var arr = collect('nested.property', 'prop');
		expect(arr).toEqual(jasmine.any(Array));
		expect(arr[0]).toEqual('nested.property');
		expect(arr[1]).toEqual(jasmine.any(Function));
		expect(arr[1].length).toEqual(2);
	});

	it('should set an array on globalConf', function() {
		collect('', 'collection')[1](fileConf, globalConf);
		expect(globalConf.collection).toEqual(jasmine.any(Array));
	});

	it('should concat collection with all matches', function() {
		collect('nested.property', 'prop')[1](fileConf, globalConf);
		expect(globalConf.prop).toEqual(['value']);
	});

});
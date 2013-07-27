/*global describe, it, expect, jasmine */

var http = require('http');
var allure = require('../src/allure');

describe('allure', function() {

	var mdpath = __dirname + '/fixture/**/*.md';

	it('should accept a server', function(done) {
		var server = http.createServer();
		var app = allure(server);

		app.config('src', mdpath);
		app.listen(8000, function() {
			expect(server).toBe(app.server);
			server.close();
			done();
		});
	});

	describe('.config', function() {
		it('should set and get values', function() {
			var app = allure();
			app.config('test', 'test1');
			expect(app.config('test')).toEqual('test1');
		});
	});

	describe('.init', function() {
		it('should callback with an object that contains a component property', function(done) {
			var app = allure();
			app.config('src', mdpath);
			app.init(function(err, config) {
				expect(config).toEqual(jasmine.any(Object));
				expect(config.components).toBeDefined();
				done();
			});
		});
		it('should use the provided src setting', function(done) {
			var app = allure();
			app.config('src', __dirname + '/fixture/basic.md');
			app.init(function(err, config) {
				expect(config.components[0].title).toEqual('component');
				done();
			});
		});
	});

	describe('.use', function() {
		it('should add plugins', function(done) {
			var app = allure();
			app.config('src', mdpath);
			app.use(function(fc, gc) {
				gc.test = 'test';
				fc.test = 'test';
			});
			app.init(function(err, config) {
				expect(config.components[0].test).toEqual('test');
				expect(config.test).toEqual('test');
				done();
			});
		});
	});

	describe('.listen', function() {
		it('should return and start an express app', function(done) {
			var app = allure();
			app.config('src', mdpath);
			var express = app.listen(8000, function(err) {
				if (err) {
					throw err;
				}
				app.server.close();
				done();
			});

			expect(express.toString()).toEqual('function app(req, res, next){ app.handle(req, res, next); }');
		});
	});

});
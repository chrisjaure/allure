/*global describe, it, expect, jasmine */

var http = require('http');
var request = require('request');
var allureApp = require('../src/app');

describe('app', function() {

	var mdpath = __dirname + '/fixture/**/*.md';

	describe('.config', function() {
		it('should set and get values', function() {
			var app = allureApp();
			app.config('test', 'test1');
			expect(app.config('test')).toEqual('test1');
		});
	});

	describe('.use', function() {
		it('should add plugins', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			app.use(function(fc, gc) {
				gc.test = 'test';
				fc.test = 'test';
			});
			app.getData(function(err, config) {
				expect(config.components[0].test).toEqual('test');
				expect(config.test).toEqual('test');
				done();
			});
		});
		it('should optionally accept a qualifier as a first argument', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', __dirname + '/fixture/basic.md');
			app.use('assets.js', plugin);
			app.use('not.there', plugin);
			app.getData(function() {
				expect(plugin.callCount).toEqual(1);
				done();
			});
		});
		it('should optionally accept an array with a qualifier', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', __dirname + '/fixture/basic.md');
			app.use(['assets.js', plugin]);
			app.use(['not.there', plugin]);
			app.getData(function() {
				expect(plugin.callCount).toEqual(1);
				done();
			});
		});
	});

	describe('.getData', function() {
		it('should callback with an object that contains a component array', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			app.getData(function(err, config) {
				expect(config).toEqual(jasmine.any(Object));
				expect(config.components).toEqual(jasmine.any(Array));
				done();
			});
		});
		it('should use the provided src setting', function(done) {
			var app = allureApp();
			app.config('src', __dirname + '/fixture/basic.md');
			app.getData(function(err, config) {
				expect(config.components[0].title).toEqual('component');
				done();
			});
		});
		it('should call plugins with allureApp as context', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			app.use(function() {
				expect(this).toBe(app);
			});
			app.getData(function() {
				done();
			});
		});
	});

	describe('.listen', function() {
		it('should return and start an express app', function(done) {
			var app = allureApp();
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
		it('should add a route to "/" that responds with the interpolated template', function(done) {
			var app = allureApp();
			app.config('src', __dirname + '/fixture/basic.md');
			app.config('template', '<p>{{ components[0].title }}</p>');
			app.listen(8000, function(err) {
				if (err) {
					throw err;
				}
				request('http://localhost:8000', function(err, res) {
					if (err) {
						throw err;
					}
					expect(res.statusCode).toEqual(200);
					expect(res.body).toEqual('<p>component</p>');
					app.server.close();
					done();
				});
			});
		});
		it('should use the provided a server', function(done) {
			var server = http.createServer();
			var app = allureApp(server);

			app.config('src', mdpath);
			app.listen(8000, function() {
				expect(server).toBe(app.server);
				server.close();
				done();
			});
		});
	});

});
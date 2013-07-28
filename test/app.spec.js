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
			app.config('test2.blah', 'test2');
			expect(app.config('test')).toEqual('test1');
			expect(app.config('test2').blah).toEqual('test2');
		});
	});

	describe('.locals', function() {
		it('should set and get values', function() {
			var app = allureApp();
			app.locals('test', 'test1');
			app.locals('test2.blah', 'test2');
			expect(app.locals('test')).toEqual('test1');
			expect(app.locals('test2').blah).toEqual('test2');
		});
	});

	describe('.plugin.before', function() {
		it('should provide a shortcut for appending items to the plugin.before local', function() {
			var app = allureApp();
			app.plugin.before('test');
			app.plugin.before('test2');
			expect(app.locals('plugin').before).toEqual(['test', 'test2']);
		});
	});

	describe('.plugin.after', function() {
		it('should provide a shortcut for appending items to the plugin.after local', function() {
			var app = allureApp();
			app.plugin.after('test');
			app.plugin.after('test2');
			expect(app.locals('plugin').after).toEqual(['test', 'test2']);
		});
	});

	describe('.use', function() {
		it('should add plugins', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', mdpath);
			app.use(plugin);
			app.getData(function() {
				expect(plugin).toHaveBeenCalled();
				done();
			});
		});
		it('should accept a qualifier as a first argument', function(done) {
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
		it('should accept an array with a qualifier', function(done) {
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
		it('should callback with a component array', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			app.getData(function(err, components) {
				expect(components).toEqual(jasmine.any(Array));
				done();
			});
		});
		it('should use the provided src setting', function(done) {
			var app = allureApp();
			app.config('src', __dirname + '/fixture/basic.md');
			app.getData(function(err, components) {
				expect(components[0].title).toEqual('component');
				done();
			});
		});
		it('should call plugins with app.plugin as context', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			app.use(function() {
				expect(this).toBe(app.plugin);
				this.locals('test', 'test');
			});
			app.getData(function() {
				expect(app.locals('test')).toEqual('test');
				done();
			});
		});
		it('should run plugins with qualifiers on every md conf', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', mdpath);
			app.use('title', plugin);
			app.getData(function() {
				expect(plugin.callCount).toBeGreaterThan(1);
				done();
			});
		});
		it('should pass an object to such plugins', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', mdpath);
			app.use('title', plugin);
			app.getData(function() {
				expect(plugin).toHaveBeenCalledWith(jasmine.any(Object));
				done();
			});
		});
		it('should run a plugin that has no qualifier only once', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', mdpath);
			app.use(plugin);
			app.getData(function() {
				expect(plugin.callCount).toEqual(1);
				done();
			});
		});
		it('should pass an array of components to such plugins', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			app.config('src', mdpath);
			app.use(plugin);
			app.getData(function() {
				expect(plugin).toHaveBeenCalledWith(jasmine.any(Array));
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
		it('should provide template and locals to renderer', function(done) {
			var app = allureApp();
			var renderer = jasmine.createSpy('renderer');
			var template = '<p></p>';
			app.config('src', __dirname + '/fixture/minimal.md');
			app.config('template', template);
			app.config('renderer', renderer);
			app.locals('test', 'test');
			app.listen(8000, function(err) {
				if (err) {
					throw err;
				}
				request('http://localhost:8000', function(err) {
					if (err) {
						throw err;
					}
					expect(renderer).toHaveBeenCalledWith(
						template,
						{ components: [{title: 'title', prop: 'val'}], test: 'test' }
					);
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
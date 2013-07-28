/*global describe, it, expect, jasmine */

var http = require('http');
var net = require('net');
var request = require('request');
var allureApp = require('../src/app');

describe('app', function() {

	var mdpath = __dirname + '/fixture/*.md';

	it('should expose the express app', function() {
		var app = allureApp();
		expect(app.express.toString()).toEqual('function app(req, res, next){ app.handle(req, res, next); }');
	});

	describe('.config', function() {
		it('should set and get values', function() {
			var app = allureApp();
			app.config('test', 'test1');
			app.config('test2.blah', 'test2');
			expect(app.config('test')).toEqual('test1');
			expect(app.config('test2').blah).toEqual('test2');
		});
		it('should allow chaining', function() {
			var app = allureApp()
				.config('test', 'test1')
				.config('test2.blah', 'test2');
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
		it('should allow chaining', function() {
			var app = allureApp()
				.locals('test', 'test1')
				.locals('test2.blah', 'test2');
			expect(app.locals('test2').blah).toEqual('test2');
		});
	});

	describe('.plugin', function() {
		describe('.config', function() {
			it('should set and get values', function() {
				var app = allureApp();
				app.plugin.config('test', 'test1');
				app.plugin.config('test2.blah', 'test2');
				expect(app.config('test')).toEqual('test1');
				expect(app.config('test2').blah).toEqual('test2');
			});
			it('should allow chaining', function() {
				var app = allureApp();
				app.plugin
					.config('test', 'test1')
					.config('test2.blah', 'test2');
				expect(app.config('test2').blah).toEqual('test2');
			});
		});

		describe('.locals', function() {
			it('should set and get values', function() {
				var app = allureApp();
				app.plugin.locals('test', 'test1');
				app.plugin.locals('test2.blah', 'test2');
				expect(app.locals('test')).toEqual('test1');
				expect(app.locals('test2').blah).toEqual('test2');
			});
			it('should allow chaining', function() {
				var app = allureApp();
				app.plugin
					.locals('test', 'test1')
					.locals('test2.blah', 'test2');
				expect(app.locals('test2').blah).toEqual('test2');
			});
		});
		describe('.before', function() {
			it('should provide a shortcut for appending items to the plugin.before local', function() {
				var app = allureApp();
				app.plugin.before('test');
				app.plugin.before('test2');
				expect(app.locals('plugin').before).toEqual(['test', 'test2']);
			});
			it('should allow chaining', function() {
				var app = allureApp();
				app.plugin.before('test').before('test2');
				expect(app.locals('plugin').before).toEqual(['test', 'test2']);
			});
		});

		describe('.after', function() {
			it('should provide a shortcut for appending items to the plugin.after local', function() {
				var app = allureApp();
				app.plugin.after('test');
				app.plugin.after('test2');
				expect(app.locals('plugin').after).toEqual(['test', 'test2']);
			});
			it('should allow chaining', function() {
				var app = allureApp();
				app.plugin.after('test').after('test2');
				expect(app.locals('plugin').after).toEqual(['test', 'test2']);
			});
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
		it('should allow chaining', function(done) {
			var app = allureApp();
			var plugin = jasmine.createSpy('plugin');
			var plugin2 = jasmine.createSpy('plugin2');
			app.config('src', mdpath);
			app.use(plugin).use(plugin2);
			app.getData(function() {
				expect(plugin2).toHaveBeenCalled();
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
			});
			app.getData(function() {
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
		it('should expect plugins with an arity of 2 to be asynchronous', function() {
			var app = allureApp();
			var plugin = function(conf, cb) {
				setTimeout(function() {
					cb();
				}, 50);
			};
			var complete = jasmine.createSpy('complete');
			app.config('src', mdpath);
			app.use(plugin);

			jasmine.Clock.useMock();

			app.getData(complete);

			expect(complete).not.toHaveBeenCalled();
			jasmine.Clock.tick(51);
			expect(complete).toHaveBeenCalled();
		});
	});

	describe('.listen', function() {
		it('should start and return the server', function(done) {
			var app = allureApp();
			app.config('src', mdpath);
			var server = app.listen(8000, function(err) {
				if (err) {
					throw err;
				}
				server.close();
				done();
			});

			expect(server instanceof net.Server).toBe(true);
		});
		it('should add a route to "/" that responds with the interpolated template', function(done) {
			var app = allureApp();
			app.config('src', __dirname + '/fixture/basic.md');
			app.config('template', '<p>{{ components[0].title }}</p>');
			var server = app.listen(8000, function(err) {
				if (err) {
					throw err;
				}
				request('http://localhost:8000', function(err, res) {
					if (err) {
						throw err;
					}
					expect(res.statusCode).toEqual(200);
					expect(res.body).toEqual('<p>component</p>');
					server.close();
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
			var server = app.listen(8000, function(err) {
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
					server.close();
					done();
				});
			});
		});
		it('should use the provided a server', function(done) {
			var server = http.createServer();
			var app = allureApp(server);
			var returnedServer;

			app.config('src', mdpath);
			returnedServer = app.listen(8000, function() {
				expect(server).toBe(returnedServer);
				server.close();
				done();
			});
		});
	});

});
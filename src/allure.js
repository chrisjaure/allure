var http = require('http');
var path = require('path');
var dotty = require('dotty');
var async = require('async');
var express = require('express');
var parseMd = require('./parseMd');

module.exports = function allure (server) {

	var plugins = [], settings = {}, app;

	if (!server) {
		server = http.createServer();
	}
	this.server = server;
	app = this.app = express();

	this.use = function(prop, plugin) {
		if (!plugin) {
			plugin = prop;
			prop = null;
		}

		plugins.push({
			match: prop,
			fn: plugin
		});

		return this;
	};

	this.config = function(name, value) {
		if (arguments.length == 2) {
			settings[name] = value;
			return this;
		}

		return settings[name];
	};

	this.listen = function() {
		var args = arguments;
		this.init(function() {
			server.on('request', app);
			server.listen.apply(server, args);
		});
		return app;
	};

	this.init = function(cb) {
		var path = this.config('src'),
			template = this.config('template'),
			fileConfs = parseMd(path),
			globalConf = {
				components: []
			};

		cb = cb || function(){};

		this.config('assets').forEach(function(asset) {
			app.use(asset.dest, express.static(asset.src));
		});

		async.eachSeries(fileConfs, function(fileConf, done) {
			applyPlugins(plugins, this, fileConf, globalConf, done);
		}, function(err) {
			app.get('/', function(req, res) {
				res.end(globalConf);
			});
			cb(err, globalConf);
		});
	};

	// defaults
	this.config('src', path.join(process.cwd(), '**', '*.md'));
	this.config('template', path.join(__dirname, 'index.html'));
	this.config('assets', []);

	return this;

};

function applyPlugins (plugins, context, fileConf, globalConf, cb) {
	async.eachSeries(plugins, function(plugin, done) {
		var error, match = true;

		if (plugin.match) {
			match = (dotty.exists(fileConf, plugin.match));
		}

		if (!match) {
			return done();
		}

		if (plugin.fn.length === 3) {
			plugin.fn.call(context, fileConf, globalConf, done);
		}
		else {
			try {
				plugin.fn.call(context, fileConf, globalConf);
			}
			catch (err) {
				error = err;
			}
			done(error);
		}

	}, function(err) {
		globalConf.components.push(fileConf);
		cb(err);
	});

}

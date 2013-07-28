var fs = require('fs');
var http = require('http');
var path = require('path');
var dotty = require('dotty');
var async = require('async');
var nunjucks = require('nunjucks');
var express = require('express');
var parseMd = require('./parseMd');

module.exports = function allure (server) {

	var plugins = [], settings = {}, app, conf;

	if (!server) {
		server = http.createServer();
	}
	this.server = server;
	app = this.app = express();

	this.use = function(prop, plugin) {
		if (!plugin) {
			if (Array.isArray(prop)) {
				plugin = prop[1];
				prop = prop[0];
			}
			else {
				plugin = prop;
				prop = null;
			}
		}

		plugins.push({
			match: prop,
			fn: plugin
		});

		return this;
	};

	this.config = function(name, value) {
		if (arguments.length === 2) {
			settings[name] = value;
			return this;
		}

		return settings[name];
	};

	this.listen = function() {
		var args = arguments;
		this.getData(function(err, data) {
			if (err) {
				throw err;
			}

			var template = this.config('template'),
				renderer = this.config('renderer');

			conf = data;
			app.get('/', function(req, res) {
				res.send(renderer(template, conf));
			});
			server.on('request', app);
			server.listen.apply(server, args);
		});
		return app;
	};

	this.getData = function(cb) {
		var src = this.config('src'),
			fileConfs = parseMd(src),
			globalConf = {
				components: []
			};

		cb = cb || function(){};

		this.config('assets').forEach(function(asset) {
			app.use(asset.dest, express.static(asset.src));
		});
		app.use('/allure', express.static(path.join(__dirname, 'public')));

		async.eachSeries(fileConfs, function(fileConf, done) {
			applyPlugins(plugins, this, fileConf, globalConf, done);
		}, function(err) {
			cb(err, globalConf);
		});
	};

	// defaults
	this.config('src', path.join(process.cwd(), '**', '*.md'));
	this.config(
		'template',
		fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8')
	);
	this.config('renderer', function renderTpl(template, data) {
		if (!renderTpl.tpl) {
			renderTpl.tpl = new nunjucks.Template(template);
		}
		return renderTpl.tpl.render(data);
	});
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

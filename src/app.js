var fs = require('fs');
var http = require('http');
var path = require('path');
var dotty = require('dotty');
var async = require('async');
var nunjucks = require('nunjucks');
var express = require('express');
var extend = require('extend');
var parseMd = require('./parseMd');

module.exports = function allure (server) {

	var plugins = [], settings = {}, locals = {}, app;

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

	this.config = setterGetter(this, settings);
	this.locals = setterGetter(this, locals);
	this.plugin = {};
	this.plugin.config = setterGetter(this.plugin, settings);
	this.plugin.locals = setterGetter(this.plugin, locals);
	this.plugin.before = appender(this.plugin.locals, 'plugin.before');
	this.plugin.after = appender(this.plugin.locals, 'plugin.after');

	this.listen = function() {
		var args = arguments;
		this.getData(function(err, components) {
			if (err) {
				throw err;
			}

			var template = this.config('template'),
				renderer = this.config('renderer');

			app.get('/', function(req, res) {
				var data = extend({
					components: components
				}, locals);
				res.send(renderer(template, data));
			});
			server.on('request', app);
			server.listen.apply(server, args);
		});
		return app;
	};

	this.getData = function(cb) {
		var src = this.config('src'),
			fileConfs = parseMd(src),
			components = [];

		cb = cb || function(){};

		this.config('assets').forEach(function(asset) {
			app.use(asset.dest, express.static(asset.src));
		});
		app.use('/allure', express.static(path.join(__dirname, 'public')));

		async.eachSeries(fileConfs, function(fileConf, done) {
			applyPlugins(plugins, this.plugin, fileConf, true, function(err, component) {
				components.push(component);
				done(err);
			});
		}, function(err) {
			if (err) {
				return cb(err);
			}
			applyPlugins(plugins, this.plugin, components, false, function(err) {
				cb(err, components);
			});
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

function appender (fn, local) {
	return function(val) {
		var arr = fn(local);
		if (!arr) {
			arr = [];
		}
		if (!Array.isArray(val)) {
			val = [val];
		}
		return fn(local, arr.concat(val));
	};
}

function setterGetter (context, obj) {
	return function(name, value) {
		if (arguments.length === 2) {
			dotty.put(obj, name, value);
			return context;
		}

		return dotty.get(obj, name);
	};
}

function applyPlugins (plugins, context, fileConf, matchOnly, cb) {
	async.eachSeries(plugins, function(plugin, done) {
		var error, match = true;

		if (plugin.match) {
			match = (dotty.exists(fileConf, plugin.match));
		}

		if (!match || (plugin.match == null && matchOnly)) {
			return done();
		}

		if (plugin.fn.length === 3) {
			plugin.fn.call(context, fileConf, done);
		}
		else {
			try {
				plugin.fn.call(context, fileConf);
			}
			catch (err) {
				error = err;
			}
			done(error);
		}

	}, function(err) {
		cb(err, fileConf);
	});

}

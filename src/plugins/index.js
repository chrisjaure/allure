var fs = require('fs');
var path = require('path');
var plugins = fs.readdirSync(__dirname);

plugins.forEach(function(plugin) {
	if (plugin === 'index.js') {
		return;
	}
	exports[path.basename(plugin, '.js')] = require('./' + plugin);
});
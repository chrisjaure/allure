var fs = require('fs');
var glob = require('glob');
var mdconf = require('mdconf');

module.exports = function parseMd (path) {

	var files = path,
		fileConfs = [];

	if (!Array.isArray(path)) {
		files = glob.sync(path);
	}

	files.forEach(function(filePath) {
		var md = fs.readFileSync(filePath).toString('utf8'),
			conf, title;

		try {
			conf = mdconf(md);
		}
		catch (e) {
			throw new Error('Unable to parse "' + filePath + '"');
		}

		title = Object.keys(conf)[0];

		if (!title) {
			return;
		}

		conf = conf[title];
		conf.title = title;

		// make separate raw properties for output
		['markup', 'style', 'script'].forEach(function(prop) {
			if (conf[prop]) {
				conf[prop+'Raw'] = JSON.parse(JSON.stringify(conf[prop]));
			}
		});
		fileConfs.push(conf);
	});

	return fileConfs;

};
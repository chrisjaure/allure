var parseMd = require('./parseMd');

module.exports = function allure (opts) {

	var path = opts.path || process.cwd() + '/**/*.md';
	return parseMd(path);

};
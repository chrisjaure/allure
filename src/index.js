var app = require('./app');

exports = module.exports = createAllureApplication;

function createAllureApplication (server) {
	return app(server);
}

exports.plugins = require('./plugins');
module.exports = function(fileConfig, globalConfig) {

	if (!globalConfig.js) {
		globalConfig.js = [];
	}

	globalConfig.js = globalConfig.js.concat(fileConfig.assets.js);

};
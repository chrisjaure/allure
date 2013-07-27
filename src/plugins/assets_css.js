module.exports = function(fileConfig, globalConfig) {

	if (!globalConfig.css) {
		globalConfig.css = [];
	}

	globalConfig.css = globalConfig.css.concat(fileConfig.assets.css);

};
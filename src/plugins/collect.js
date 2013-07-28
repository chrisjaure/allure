var dotty = require('dotty');

module.exports = function(qualifier, globalProp) {

	var collect = function (fileConfig, globalConfig) {

		if (!globalConfig[globalProp]) {
			globalConfig[globalProp] = [];
		}

		globalConfig[globalProp] = globalConfig[globalProp].concat(dotty.get(fileConfig, qualifier));

	};

	return [qualifier, collect];

};
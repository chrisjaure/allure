var dotty = require('dotty');

module.exports = function(qualifier) {

	qualifier = qualifier || 'angular';

	return function angular(components) {
		var modules = [];
		components.forEach(function(conf) {
			if (dotty.exists(conf, qualifier)) {
				modules = modules.concat(dotty.get(conf, qualifier));
			}
		});

		this.before('<script>angular.module("Allure", '+ JSON.stringify(modules) +');</script>');
	};

};
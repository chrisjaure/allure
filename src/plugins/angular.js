var collect = require('./collect');

module.exports = function(qualifier) {

	qualifier = qualifier || 'angular';

	return collect(qualifier, function(modules) {
		this.before('<script>angular.module("Allure", '+ JSON.stringify(modules) +');</script>');
	});

};
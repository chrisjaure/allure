var dotty = require('dotty');

module.exports = function(qualifier, local) {

	var collect = function (fileConfig) {

		var arr = this.locals(local);

		if (!arr) {
			arr = [];
		}

		this.locals(local, arr.concat(dotty.get(fileConfig, qualifier)));

	};

	return [qualifier, collect];

};
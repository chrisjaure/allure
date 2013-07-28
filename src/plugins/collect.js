var dotty = require('dotty');

module.exports = function(qualifier, fn) {

	function collect (components) {

		var collection = [];

		components.forEach(function(conf) {
			if (dotty.exists(conf, qualifier)) {
				collection = collection.concat(dotty.get(conf, qualifier));
			}
		});

		return collection;
	}

	if (fn.length === 2) {
		return function asyncCollect(components, done) {
			fn.call(this, collect(components), done);
		};
	}

	return function syncCollect(components) {
		fn.call(this, collect(components));
	};

};
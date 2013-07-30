var collect = require('./collect');

module.exports = function(qualifier) {

	qualifier = qualifier || 'assets';

	return collect(qualifier, function(assets) {
		assets.forEach(function(asset) {
			if (asset.css) {
				asset.css.forEach(function(href) {
					this.before('<link href="'+ href +'" rel="stylesheet" />');
				}.bind(this));
			}
			if (asset.js) {
				asset.js.forEach(function(src) {
					this.before('<script src="'+ src +'" type="text/javascript"></script>');
				}.bind(this));
			}
		}.bind(this));
		
	});

};
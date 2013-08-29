var collect = require('./collect');

module.exports = function(qualifier) {

	qualifier = qualifier || 'assets';

	return collect(qualifier, function(assets) {
		assets.forEach(function(asset) {
			if (asset.css) {
				asset.css.forEach(function(href) {
					var stylesheet = '<link href="'+ href +'" rel="stylesheet" />';
					if (this.locals('plugin.before').indexOf(stylesheet) === -1) {
						this.before(stylesheet);
					}
				}.bind(this));
			}
			if (asset.js) {
				asset.js.forEach(function(src) {
					var script = '<script src="'+ src +'" type="text/javascript"></script>';
					if (this.locals('plugin.before').indexOf(script) === -1) {
						this.before(script);
					}
				}.bind(this));
			}
		}.bind(this));
		
	});

};
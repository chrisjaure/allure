var allure = require('../src');
var app = allure()
	.config('src', __dirname+'/fixture/*.md')
	.use(allure.plugins.assets());

app.listen(8001);
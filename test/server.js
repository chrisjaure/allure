var allure = require('../src');
var app = allure()
	.config('src', __dirname+'/fixture/*.md');

app.listen(8001);
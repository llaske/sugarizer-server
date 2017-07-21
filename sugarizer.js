// require files
var express = require('express'),
	settings = require('./config/settings'),
	app = express(),
	ini = settings.load();

//configure app setting
require('./config/main')(app, ini);

// include api routes
require('./api/route')(app, ini);

// include dashboard routes
require('./dashboard/route')(app, ini);

// Start listening
app.listen(ini.web.port);
console.log("Sugarizer Server is listening on port " + ini.web.port + "...");

//export app for testing
module.exports = app;

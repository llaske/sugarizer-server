// require files
var express = require('express'),
	http = require('http'),
	https = require('https'),
	settings = require('./config/settings'),
	wait4db = require('./config/wait4db'),
	common = require('./dashboard/helper/common');
	ini = settings.load(),
	app = express(),
	server = null;

// wait for database
wait4db.waitConnection(ini, function() {
	// init common
	common.init(ini);

	//configure app setting
	require('./config/main')(app, ini);

	// include api routes
	require('./api/route')(app, ini);

	// include dashboard routes
	require('./dashboard/route')(app, ini);

	// Handle https
	if (ini.security.https) {
		var credentials = common.loadCredentials(ini);
		if (!credentials) {
			console.log("Error reading HTTPS credentials");
			process.exit(-1);
		}
		server = https.createServer(credentials, app);
	} else {
		server = http.createServer(app);
	}

	// Start listening
	server.listen(ini.web.port);
	console.log("Sugarizer Server is listening on"+(ini.security.https ? " secure":"")+" port " + ini.web.port + "...");
});

//export app for testing
module.exports = app;

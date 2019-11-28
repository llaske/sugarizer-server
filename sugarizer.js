// require files
var express = require('express'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	process = require('process'),
	settings = require('./config/settings'),
	wait4db = require('./config/wait4db'),
	common = require('./dashboard/helper/common'),
	ini = settings.load(),
	app = express(),
	server = null;

// Prevent uncaught exception
process.on("uncaughtException", function(err) {
	console.error("FATAL ERROR, uncaught exception '" + err.message + "'");
	console.error(err.stack);
	process.exit(-1);
});

// wait for database
wait4db.waitConnection(ini, function(db) {
	if (!db) {
		console.log("Cannot connect with the database");
		process.exit(-1);
	}
	// init common
	common.init(ini);

	//configure app setting
	require('./config/main')(app, ini);

	// include api routes
	require('./api/route')(app, ini, db);

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

	// Check node version
	var nodev = (process.versions.node).split(".");
	if (parseInt(nodev[0]) < 6) {
		console.log("Ooops! Sugarizer require node v6+, current version is v"+process.versions.node);
		process.exit(-1);
	}

	// Start listening
	var info = JSON.parse(fs.readFileSync("./package.json", 'utf-8'));
	console.log("   _____                        _              ");
	console.log("  / ____|                      (_)             ");
	console.log(" | (___  _   _  __ _  __ _ _ __ _ _______ _ __ ");
	console.log("  \\___ \\| | | |/ _` |/ _` | '__| |_  / _ \\ '__|");
	console.log("  ____) | |_| | (_| | (_| | |  | |/ /  __/ |   ");
	console.log(" |_____/ \\__,_|\\__, |\\__,_|_|  |_/___\\___|_|   ");
	console.log("                __/ |                          ");
	console.log("               |___/                           ");
	console.log(info.description+" v"+info.version);
	console.log("node v"+process.versions.node);
	console.log("Settings file './env/"+(process.env.NODE_ENV ? process.env.NODE_ENV : 'sugarizer')+".ini'");
	server.listen(ini.web.port, function() {
		console.log("API is listening on"+(ini.security.https ? " secure":"")+" port " + ini.web.port + "...");
	}).on('error', function(err) {
		console.log("Ooops! cannot launch API on port "+ ini.web.port+", error code "+err.code);
		process.exit(-1);
	});
});

//export app for testing
module.exports = app;

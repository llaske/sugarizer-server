// require files
var express = require('express'),
	settings = require('./config/settings'),
	app = express(),
	ini = settings.load();

//configure app setting
require('./config/main')(app, ini);

//force login ONLY for dev purpose @TODO
// app.use(function(req, res, next) {
// 	req.session.user = {
// 		token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDAwNjkzOTc1NTZ9.BU7LULkVZ2vZHHvyspiphbKbX9jjc_ie1DCmXagYeu0',
// 		expires: 1500069397556,
// 		user: {
// 			_id: '59582864c7780794574a5b5d',
// 			name: 'tarun',
// 			password: 'pokemon',
// 			role: 'admin',
// 			timestamp: 1498949732800
// 		}
// 	}
// 	next();
// });

// include api routes
require('./api/route')(app, ini);

// include dashboard routes
require('./dashboard/route')(app, ini);

// Start listening
app.listen(ini.web.port);
console.log("Sugarizer server listening on port " + ini.web.port + "...");

//export app for testing
module.exports = app;

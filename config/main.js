var express = require('express'),
	fs = require('fs'),
	ini = require('ini'),
	ejs = require('ejs'),
	bodyParser = require('body-parser'),
	expressSession = require('express-session'),
	cookieParser = require('cookie-parser'),
	flash = require('express-flash'),
	expressValidator = require('express-validator')

// configure app settings
module.exports = function(app, ini) {

	// must use cookieParser before express Session
	app.use(cookieParser());
	app.use(expressSession({
		secret: require('./secret')(),
		cookie: {
			maxAge: parseInt(ini.cookie.max_age) //2 day
		},
		resave: true,
		saveUninitialized: true
	}));

	//include body parser
	app.use(bodyParser.urlencoded({
		limit: '5mb',
		extended: false
	}))
	app.use(bodyParser.json({
		limit: '5mb',
		type: '*/*'
	}))

	//include expressValidator
	app.use(expressValidator());

	// include flash notification
	app.use(flash());

	//logger
	if (process.env.NODE_ENV !== 'test') {
		app.use(express.logger('dev'));
	}

	// Add headers
	app.use(function(req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'x-key,x-access-token');
		next();
	});

	// header's fix
	app.use(function(req, res, next) {
		var _send = res.send;
		var sent = false;
		res.send = function(data) {
			if (sent) return;
			_send.bind(res)(data);
			sent = true;
		};
		next();
	});

	//store ini in every request useful for dashboard
	app.use(function(req, res, next) {
		req.iniconfig = ini;
		next();
	});

	// Set .html as the default template extension
	app.set('view engine', 'ejs');

	// Tell express where it can find the templates
	app.set('views', __dirname + '/../dashboard/views');

	// Make the files in the public folder available to the world
	app.use('/public', express.static(__dirname + '/../dashboard/public'));

	// Make the activities folder available to the world
	app.use('/', express.static(__dirname + '/../' + ini.client.path));

	// Make the docs folder available to the world
	app.use('/docs', express.static(__dirname + '/../docs/www'));
};

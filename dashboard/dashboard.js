//require files need for server to work
var express = require('express'),
	fs = require('fs'),
	moment = require('moment'),
	ini = require('ini'),
	ejs = require('ejs'),
	request = require('request'),
	app = express(),
	bodyParser = require('body-parser'),
	expressSession = require('express-session'),
	cookieParser = require('cookie-parser'),
	flash = require('express-flash'),
	path = require('path'),
	expressValidator = require('express-validator'),
	authController = require('./controller/auth');

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({
	secret: 'somesecrettokenhere'
}));
app.use(bodyParser());
app.use(expressValidator());
app.use(flash());

// Set .html as the default template extension
app.set('view engine', 'ejs');

// Tell express where it can find the templates
app.set('views', __dirname + '/views');

// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/public'));

//varialbes.inc file
var cfs = ini.parse(fs.readFileSync('./config/dashboard.ini', 'utf-8'));

//pass config variables to all routes
app.use(function(req, res, next) {
	req.iniconfig = cfs;
	next();
});

//Only the requests that start with /api/v1/* will be checked for the token.
app.all('/app/*', [authController.validateSession]);

// add routes
app.get('/', authController.index);
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.get('/logout', authController.logout);
app.get('/app/dashboard', function(req, res) {
	res.render('dashboard', {
		'module': 'dashboard',
	});
});

// If no route is matched by now, it must be a 404
app.use(function(req, res) {
	// 404
	res.render('404', {
		'config': cfs,
		'module': 'error',
		"status": 404,
		"message": "Route Not Found!",
		"url": req.protocol + '://' + req.get('host') + req.originalUrl
	});
});

//listen to the port
app.listen(cfs.web.port);
console.log('Your application is running on port:' + cfs.web.port);

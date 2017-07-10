//require files need for server to work
var express = require('express'),
	fs = require('fs'),
	moment = require('moment'),
	ini = require('ini'),
	ejs = require('ejs'),
	app = express(),
	bodyParser = require('body-parser'),
	expressSession = require('express-session'),
	cookieParser = require('cookie-parser'),
	flash = require('express-flash'),
	expressValidator = require('express-validator'),
	authController = require('./controller/auth'),
	usersController = require('./controller/users'),
	activitiesController = require('./controller/activities'),
	journalController = require('./controller/journal'),
	dashboardController = require('./controller/dashboard');

// must use cookieParser before expressSession
app.use(cookieParser());
app.use(expressSession({
	secret: 'somesecrettokenhere',
	cookie: {
		maxAge: (3600 * 24)
	}
}));
app.use(bodyParser());
app.use(expressValidator());
app.use(flash());


// Set .html as the default template extension
app.set('view engine', 'ejs');

// Tell express where it can find the templates
app.set('views', __dirname + '/views');

// Make the files in the public folder available to the world
app.use('/public', express.static(__dirname + '/public'));

//varialbes.inc file
var cfs = ini.parse(fs.readFileSync('./config/dashboard.ini', 'utf-8'));

//pass config variables to all routes
app.use(function(req, res, next) {
	req.iniconfig = cfs;

	//force login ONLY @TODO
	req.session.user = {
		token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDAwNjkzOTc1NTZ9.BU7LULkVZ2vZHHvyspiphbKbX9jjc_ie1DCmXagYeu0',
		expires: 1500069397556,
		user: {
			_id: '59582864c7780794574a5b5d',
			name: 'tarun',
			password: 'pokemon',
			role: 'admin',
			timestamp: 1498949732800
		}
	}

	next();
});

//Only the requests that start with /api/v1/* will be checked for the token.
app.all('/app/*', [authController.validateSession]);

// add routes
app.get('/', authController.index);
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.get('/logout', authController.logout);
app.get('/app/dashboard', dashboardController.index);
app.get('/app/users', usersController.index);
app.get('/app/users/add', usersController.addUser);
app.post('/app/users/add', usersController.addUser);
app.get('/app/users/edit/:uid', usersController.editUser);
app.post('/app/users/edit/:uid', usersController.editUser);
app.get('/app/users/delete/:uid', usersController.deleteUser);
app.get('/app/journal', journalController.index);
app.get('/app/activities', activitiesController.index);

// If no route is matched by now, it must be a 404
app.use(function(req, res) {
	// 404
	res.render('404', {
		'config': cfs,
		'module': 'Error',
		"status": 404,
		"message": "Route Not Found!",
		"url": req.protocol + '://' + req.get('host') + req.originalUrl
	});
});

//listen to the port
app.listen(cfs.web.port);
console.log('Your application is running on port:' + cfs.web.port);

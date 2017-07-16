// require files
var authController = require('./controller/auth'),
	usersController = require('./controller/users'),
	activitiesController = require('./controller/activities'),
	journalController = require('./controller/journal'),
	dashboardController = require('./controller/dashboard');

module.exports = function(app, ini) {

	//Only the requests that start with /dashboard/* will be checked for the validation.
	app.all('/dashboard/*', [authController.validateSession]);

	// add routes
	app.get('/', authController.index);
	app.get('/login', authController.getLogin);
	app.post('/login', authController.postLogin);
	app.get('/logout', authController.logout);
	app.get('/dashboard', dashboardController.index);
	app.get('/dashboard/users', usersController.index);
	app.get('/dashboard/users/add', usersController.addUser);
	app.post('/dashboard/users/add', usersController.addUser);
	app.get('/dashboard/users/edit/:uid', usersController.editUser);
	app.post('/dashboard/users/edit/:uid', usersController.editUser);
	app.get('/dashboard/users/delete/:uid', usersController.deleteUser);
	app.get('/dashboard/journal', journalController.index);
	app.get('/dashboard/activities', activitiesController.index);

	// If no route is matched by now, it must be a 404
	app.use('/dashboard/*', function(req, res) {
		// 404
		res.render('404', {
			'config': ini,
			'module': 'Error',
			"status": 404,
			"message": "Route Not Found!",
			"url": req.protocol + '://' + req.get('host') + req.originalUrl
		});
	});
}

// import multer for file upload
var multer = require('multer');

// Define upload path
var upload = multer({ dest: 'tmp/csv/' });

// require files
var authController = require('./controller/auth'),
	usersController = require('./controller/users'),
	activitiesController = require('./controller/activities'),
	journalController = require('./controller/journal'),
	dashboardController = require('./controller/dashboard'),
	graphController = require('./controller/graph'),
	classroomsController = require('./controller/classrooms'),
	statsController = require('./controller/stats');

module.exports = function(app, ini) {

	// init routes using settings
	authController.init(ini);
	usersController.init(ini);
	activitiesController.init(ini);
	journalController.init(ini);
	dashboardController.init(ini);
	statsController.init(ini);
	classroomsController.init(ini);

	app.use(function(req, res, next) {
		res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		next();
  	});
	
	// add routes
	app.get('/dashboard/login', authController.getLogin);
	app.post('/dashboard/login', authController.postLogin);
	app.get('/dashboard/verify2FA', authController.verify2FA);
	app.post('/dashboard/verify2FA', authController.verify2FA);
	app.get('/dashboard/logout', authController.logout);
	app.get('/dashboard', authController.validateSession, dashboardController.index);
	app.get('/dashboard/users', authController.validateSession, usersController.index);
	app.get('/dashboard/users/search', authController.validateSession, usersController.searchUser);
	app.get('/dashboard/users/add', authController.validateSession, usersController.addUser);
	app.post('/dashboard/users/add', authController.validateSession, usersController.addUser);
	app.post('/dashboard/users/import', upload.single('file'), usersController.importCSV);
	app.get('/dashboard/users/export', authController.validateSession, usersController.exportCSV);
	app.get('/dashboard/users/edit/:uid', authController.validateSession, usersController.editUser);
	app.post('/dashboard/users/edit/:uid', authController.validateSession, usersController.editUser);
	app.get('/dashboard/users/delete/:uid', authController.validateSession, usersController.deleteUser);
	app.get('/dashboard/journal', authController.validateSession, journalController.index);
	app.get('/dashboard/journal/:jid', authController.validateSession, journalController.getEntries);
	app.get('/dashboard/journal/:jid/delete/:oid', authController.validateSession, journalController.deleteEntry);
	app.get('/dashboard/activities', authController.validateSession, activitiesController.index);
	app.get('/dashboard/activities/launch', authController.validateSession, activitiesController.fakeLaunch);
	app.get('/dashboard/activities/launch/:jid', authController.validateSession, activitiesController.launch);
	app.get('/dashboard/stats', authController.validateSession, authController.checkRole(statsController.index));
	app.get('/dashboard/stats/add', authController.validateSession, authController.checkRole(statsController.addChart));
	app.post('/dashboard/stats/add', authController.validateSession, authController.checkRole(statsController.addChart));
	app.get('/dashboard/stats/edit/:chartid', authController.validateSession, authController.checkRole(statsController.editChart));
	app.post('/dashboard/stats/edit/:chartid', authController.validateSession, authController.checkRole(statsController.editChart));
	app.get('/dashboard/stats/delete/:chartid', authController.validateSession, authController.checkRole(statsController.deleteChart));
	app.get('/dashboard/stats/list', authController.validateSession, authController.checkRole(statsController.listCharts));
	app.get('/dashboard/stats/graph', authController.validateSession, statsController.getGraph);
	app.get('/dashboard/graph', authController.validateSession, graphController.getGraph);
	app.get('/dashboard/profile', authController.validateSession, usersController.profile);
	app.post('/dashboard/profile', authController.validateSession, usersController.profile);

	//two-factor routes
	app.get('/dashboard/profile/enable2FA', authController.validateSession, usersController.enable2FA);
	app.post('/dashboard/profile/enable2FA', authController.validateSession, usersController.enable2FA);
	app.post('/dashboard/profile/disable2FA', authController.validateSession, usersController.disable2FA);

	// classrooms routes
	app.get('/dashboard/classrooms', authController.validateSession, classroomsController.index);
	app.get('/dashboard/classrooms/add', authController.validateSession, authController.checkRole(classroomsController.addClassroom));
	app.post('/dashboard/classrooms/add', authController.validateSession, authController.checkRole(classroomsController.addClassroom));
	app.get('/dashboard/classrooms/edit/:classid', authController.validateSession, authController.checkRole(classroomsController.editClassroom));
	app.post('/dashboard/classrooms/edit/:classid', authController.validateSession, authController.checkRole(classroomsController.editClassroom));
	app.get('/dashboard/classrooms/delete/:classid', authController.validateSession, authController.checkRole(classroomsController.deleteClassroom));


	// If no route is matched by now, it must be a 404
	app.get('/dashboard/*', function(req, res) {
		res.render('404', {
			"message": "Route Not Found!",
			"url": req.protocol + '://' + req.get('host') + req.originalUrl
		});
	});
};

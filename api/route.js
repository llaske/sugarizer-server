//include libraries
var activities = require('./controller/activities'),
	journal = require('./controller/journal'),
	users = require('./controller/users'),
	classrooms = require('./controller/classrooms'),
	auth = require('./controller/auth'),
	stats = require('./controller/stats'),
	validate = require('./middleware/validateRequest'),
	presence = require('./middleware/presence'),
	common = require('../dashboard/helper/common');

module.exports = function(app, ini) {

	//Only the requests that start with /api/v1/* will be checked for the token.
	app.all('/api/v1/*', [validate]);

	// Init modules
	activities.load(ini);
	journal.init(ini);
	users.init(ini);
	presence.init(ini);
	stats.init(ini);
	classrooms.init(ini);

	// Routes that can be accessed by any one
	app.get('/api', common.getAPIInfo);
	app.post('/auth/login', auth.login);
	app.post('/auth/signup', auth.signup);

	// Register activities list API
	app.get("/api/v1/activities", activities.findAll);
	app.post("/api/v1/activities", activities.updateActivities);
	app.get("/api/v1/activities/:id", activities.findById);

	// Register users API
	app.get("/api/v1/users", users.findAll);
	app.get("/api/v1/users/:uid", users.findById);
	app.post("/api/v1/users", users.addUser);
	app.put("/api/v1/users/:uid", users.updateUser);
	app.delete("/api/v1/users/:uid", users.removeUser);

	// Register stats API
	app.get("/api/v1/stats", stats.findAll);
	app.post("/api/v1/stats", stats.addStats);
	app.delete("/api/v1/stats", stats.deleteStats);

	// Register journal API
	app.get("/api/v1/journal", journal.findAll);
	app.get("/api/v1/journal/:jid", journal.findJournalContent);
	app.post("/api/v1/journal/:jid", journal.addEntryInJournal);
	app.put("/api/v1/journal/:jid", journal.updateEntryInJournal);
	app.delete("/api/v1/journal/:jid", journal.removeInJournal);

	// Register classroom API
	app.get("/api/v1/classrooms", auth.checkAdmin, classrooms.findAll);
	app.get("/api/v1/classrooms/:classid", auth.checkAdmin, classrooms.findById);
	app.post("/api/v1/classrooms", auth.checkAdmin, classrooms.addClassroom);
	app.put("/api/v1/classrooms/:classid", auth.checkAdmin, classrooms.updateClassroom);
	app.delete("/api/v1/classrooms/:classid", auth.checkAdmin, classrooms.removeClassroom);

	// If no route is matched by now, it must be a 404
	app.use('/api/v1/*', function(req, res, next) {
		return res.status(404).res.json({
			'status': 404,
			'error': "Route Not Found!",
			'code': 7,
			'url': req.protocol + '://' + req.get('host') + req.originalUrl
		});
	});
};

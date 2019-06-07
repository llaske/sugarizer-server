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

// Define roles
// eslint-disable-next-line no-unused-vars
var Admin="admin", Teacher="teacher", Student="student";

module.exports = function(app, ini, db) {

	//Only the requests that start with /api/v1/* will be checked for the token.
	app.all('/api/v1/*', [validate]);

	// Init modules
	activities.load(ini);
	journal.init(ini, db);
	users.init(ini, db);
	presence.init(ini, db);
	stats.init(ini, db);
	classrooms.init(ini, db);

	// Routes that can be accessed by any one
	app.get('/api', common.getAPIInfo);
	app.post('/auth/login', auth.login);
	app.post('/auth/signup', auth.checkAdminOrLocal, auth.signup);

	// Register activities list API
	app.get("/api/v1/activities", activities.findAll);
	app.post("/api/v1/activities", activities.updateActivities);
	app.get("/api/v1/activities/:id", activities.findById);

	// Register users API
	app.get("/api/v1/users", auth.allowedRoles([Admin, Student, Teacher]), users.findAll);
	app.get("/api/v1/users/:uid", auth.allowedRoles([Admin, Student, Teacher]), users.findById);
	app.get("/api/v1/users/:uid/classroom", auth.allowedRoles([Admin, Teacher]), users.findClassroom);
	app.post("/api/v1/users", auth.allowedRoles([Admin]), users.addUser);
	app.put("/api/v1/users/:uid", auth.allowedRoles([Admin, Student, Teacher]), users.updateUser);
	app.delete("/api/v1/users/:uid", auth.allowedRoles([Admin, Student]), users.removeUser);

	// Register stats API
	app.get("/api/v1/stats", stats.findAll);
	app.post("/api/v1/stats", stats.addStats);
	app.delete("/api/v1/stats", stats.deleteStats);

	// Register journal API
	app.get("/api/v1/journal", journal.findAll);
	app.get("/api/v1/journal/aggregate", auth.allowedRoles([Admin]), journal.findAllEntries);
	app.get("/api/v1/journal/:jid", journal.findJournalContent);
	app.post("/api/v1/journal/:jid", journal.addEntryInJournal);
	app.put("/api/v1/journal/:jid", journal.updateEntryInJournal);
	app.delete("/api/v1/journal/:jid", journal.removeInJournal);

	// Register classroom API
	app.get("/api/v1/classrooms", auth.allowedRoles([Admin, Teacher]), classrooms.findAll);
	app.get("/api/v1/classrooms/:classid", auth.allowedRoles([Admin, Teacher]), classrooms.findById);
	app.post("/api/v1/classrooms", auth.allowedRoles([Admin]), classrooms.addClassroom);
	app.put("/api/v1/classrooms/:classid", auth.allowedRoles([Admin]), classrooms.updateClassroom);
	app.delete("/api/v1/classrooms/:classid", auth.allowedRoles([Admin]), classrooms.removeClassroom);

	// If no route is matched by now, it must be a 404
	app.use('/api/v1/*', function(req, res) {
		return res.status(404).json({
			'status': 404,
			'error': "Route Not Found!",
			'code': 7,
			'url': req.protocol + '://' + req.get('host') + req.originalUrl
		});
	});
};

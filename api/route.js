//include libraries
var activities = require('./controller/activities'),
	journal = require('./controller/journal'),
	users = require('./controller/users'),
	classrooms = require('./controller/classrooms'),
	charts = require('./controller/charts'),
	auth = require('./controller/auth'),
	stats = require('./controller/stats'),
	validate = require('./middleware/validateRequest'),
	common = require('../dashboard/helper/common'),
	assignments = require('./controller/assignments');

// Define roles
// eslint-disable-next-line no-unused-vars
var Admin = "admin", Teacher = "teacher", Student = "student";

module.exports = function (app, ini, db) {

	//Only the requests that start with /api/v1/* will be checked for the token.
	app.all('/api/v1/*', [validate(false)]);//validate(partialAccess): partialAccess is middleware boolean. See middleware/validateRequest.js for more info.

	// Init modules
	activities.load(ini, db);
	journal.init(ini, db);
	users.init(ini, db);
	stats.init(ini, db);
	classrooms.init(ini, db);
	charts.init(ini, db);
	assignments.init(ini, db);
	auth.init(ini);

	// Routes that can be accessed by any one
	app.get('/api', common.getAPIInfo);
	app.post('/auth/verify2FA', [validate(true)], auth.verify2FA);//validate(partialAccess): partialAccess is middleware boolean. See middleware/validateRequest.js for more info.
	app.post('/auth/login', auth.login);
	app.post('/auth/signup', auth.checkAdminOrLocal, auth.signup);

	// Register activities list API
	app.get("/api/v1/activities", auth.allowedRoles([Admin, Student, Teacher]), activities.findAll);
	app.post("/api/v1/activities", auth.allowedRoles([Admin]), activities.updateActivities);
	app.get("/api/v1/activities/:id", auth.allowedRoles([Admin, Student, Teacher]), activities.findById);

	// Register users API
	app.get("/api/v1/users", auth.allowedRoles([Admin, Student, Teacher]), users.findAll);
	app.get("/api/v1/users/:uid", auth.allowedRoles([Admin, Student, Teacher]), users.findById);
	app.post("/api/v1/users", auth.allowedRoles([Admin, Teacher]), users.addUser);
	app.put("/api/v1/users/:uid", auth.allowedRoles([Admin, Student, Teacher]), users.updateUser);
	app.delete("/api/v1/users/:uid", auth.allowedRoles([Admin, Student, Teacher]), users.removeUser);

	//Register 2Factor API
	app.get("/api/v1/dashboard/profile/enable2FA", auth.allowedRoles([Admin, Teacher]), users.updateSecret);
	app.put("/api/v1/dashboard/profile/enable2FA", auth.allowedRoles([Admin, Teacher]), users.verifyTOTP);
	app.put("/api/v1/dashboard/profile/disable2FA", auth.allowedRoles([Admin, Teacher]), users.disable2FA);

	// Register stats API
	app.get("/api/v1/stats", auth.allowedRoles([Admin, Student, Teacher]), stats.findAll);
	app.post("/api/v1/stats", auth.allowedRoles([Admin, Student, Teacher]), stats.addStats);
	app.delete("/api/v1/stats", auth.allowedRoles([Admin, Student, Teacher]), stats.deleteStats);

	// Register journal API
	app.get("/api/v1/journal", auth.allowedRoles([Admin, Student, Teacher]), journal.findAll);
	app.get("/api/v1/journal/aggregate", auth.allowedRoles([Admin, Teacher]), journal.findAllEntries);
	app.get("/api/v1/journal/:jid", auth.allowedRoles([Admin, Student, Teacher]), journal.findJournalContent);
	app.post("/api/v1/journal/:jid", auth.allowedRoles([Admin, Student, Teacher]), journal.addEntryInJournal);
	app.put("/api/v1/journal/:jid", auth.allowedRoles([Admin, Student, Teacher]), journal.updateEntryInJournal);
	app.delete("/api/v1/journal/:jid", auth.allowedRoles([Admin, Student, Teacher]), journal.removeInJournal);

	// Register classroom API
	app.get("/api/v1/classrooms", auth.allowedRoles([Admin, Teacher]), classrooms.findAll);
	app.get("/api/v1/classrooms/:classid", auth.allowedRoles([Admin, Teacher]), classrooms.findById);
	app.post("/api/v1/classrooms", auth.allowedRoles([Admin]), classrooms.addClassroom);
	app.put("/api/v1/classrooms/:classid", auth.allowedRoles([Admin, Teacher]), classrooms.updateClassroom);
	app.delete("/api/v1/classrooms/:classid", auth.allowedRoles([Admin]), classrooms.removeClassroom);

	//Register Assignments APIs
	app.get("/api/v1/assignments", auth.allowedRoles([Admin, Teacher]), assignments.findAll);
	app.get("/api/v1/assignments/deliveries/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.findAllDeliveries);
	app.get("/api/v1/assignments/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.findById);
	app.post("/api/v1/assignments/", auth.allowedRoles([Admin, Teacher]), assignments.addAssignment);
	app.get("/api/v1/assignments/launch/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.launchAssignment);
	app.put("/api/v1/assignments/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.updateAssignment);
	app.delete("/api/v1/assignments/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.removeAssignment);
	app.put("/api/v1/assignments/deliveries/comment/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.updateComment);
	app.put("/api/v1/assignments/deliveries/submit/:assignmentId", auth.allowedRoles([Admin, Teacher, Student]), assignments.submitAssignment);
	app.put("/api/v1/assignments/deliveries/return/:assignmentId", auth.allowedRoles([Admin, Teacher]), assignments.returnAssignment);
	// Register classroom API
	app.get("/api/v1/charts", auth.allowedRoles([Admin]), charts.findAll);
	app.get("/api/v1/charts/:chartid", auth.allowedRoles([Admin]), charts.findById);
	app.post("/api/v1/charts", auth.allowedRoles([Admin]), charts.addChart);
	app.put("/api/v1/charts/reorder", auth.allowedRoles([Admin]), charts.reorderChart);
	app.put("/api/v1/charts/:chartid", auth.allowedRoles([Admin]), charts.updateChart);
	app.delete("/api/v1/charts/:chartid", auth.allowedRoles([Admin]), charts.removeChart);

	// If no route is matched by now, it must be a 404
	app.use('/api/v1/*', function (req, res) {
		return res.status(404).json({
			'status': 404,
			'error': "Route Not Found!",
			'code': 7,
			'url': req.protocol + '://' + req.get('host') + req.originalUrl
		});
	});
};

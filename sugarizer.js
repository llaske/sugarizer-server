// Sugarizer server

var express = require('express'),
	settings = require('./app/config/settings'),
	activities = require('./app/routes/activities'),
	journal = require('./app/routes/journal'),
	users = require('./app/routes/users'),
	auth = require('./app/routes/auth'),
	stats = require('./app/routes/stats'),
	validate = require('./app/middleware/validateRequest'),
	presence = require('./app/middleware/presence');

var app = express();

app.configure(function() {
	if (process.env.NODE_ENV !== 'test') {
		app.use(express.logger('dev'));
	}
	app.use(express.bodyParser());
});

//load conf file
var confFile = process.env.NODE_ENV;
var ini = settings.load(confFile);

//Only the requests that start with /api/v1/* will be checked for the token.
app.all('/api/v1/*', [validate]);

// Init modules
activities.load(ini);
journal.init(ini);
users.init(ini);
presence.init(ini);
stats.init(ini);

/*
 * Routes that can be accessed by any one
 */
app.post('/login', auth.login);
app.post('/signup', auth.signup);

// Register activities list API
app.get("/api/v1/activities", activities.findAll);
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

// Register journal API
app.get("/api/v1/journal/shared", journal.findSharedJournal);
app.get("/api/v1/journal/:jid", journal.findJournalContent);
app.post("/api/v1/journal/:jid", journal.addEntryInJournal);
app.put("/api/v1/journal/:jid", journal.updateEntryInJournal);
app.delete("/api/v1/journal/:jid", journal.removeEntryInJournal);

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
	res.status(404);
	res.json({
		"status": 404,
		"message": "Route Not Found!",
		"url": req.protocol + '://' + req.get('host') + req.originalUrl
	});
	return;
});

// Start listening
app.listen(ini.web.port);
console.log("Sugarizer server listening on port " + ini.web.port + "...");

//export app for testing
module.exports = app;

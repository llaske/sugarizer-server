// Sugarizer server

var express = require('express'),
	settings = require('./app/config/settings'),
	activities = require('./app/routes/activities'),
	journal = require('./app/routes/journal'),
	users = require('./app/routes/users'),
	auth = require('./app/routes/auth'),
	validate = require('./app/middleware/validateRequest'),
	presence = require('./app/middleware/presence');


var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

/**
 * Only the requests that start with /api/v1/* will be checked for the token.
 * Any URL's that do not follow the below pattern should be avoided unless you
 * are sure that authentication is not needed
 */
app.all('/api/v1/*', [validate]);

// Load settings
var confFile = null;
if (process.argv.length >= 3) {
	confFile = process.argv[2];
}
settings.load(function(ini) {
	// Init modules
	activities.load(ini);
	journal.init(ini);
	users.init(ini);
	presence.init(ini);

	/*
	 * Routes that can be accessed by any one
	 */
	app.post('/login', auth.login);
	// app.post('/signup', auth.signup);

	// Register activities list API
	app.get("/api/v1/activities", activities.findAll);
	app.get("/api/v1/activities/:id", activities.findById);

	// Register users API
	app.get("/api/v1/users", users.findAll);
	app.get("/api/v1/users/:uid", users.findById);
	app.post("/api/v1/users", users.addUser);
	app.put("/api/v1/users/:uid", users.updateUser);

	// Register journal API
	app.get("/api/v1/journal/shared", journal.findSharedJournal);
	app.get("/api/v1/journal/:jid", journal.findJournalContent);
	app.get("/api/v1/journal/:jid/filter/:aid", journal.findJournalContent);
	app.get("/api/v1/journal/:jid/field/:field", journal.findJournalContent);
	app.get("/api/v1/journal/:jid/filter/:aid/field/:field", journal.findJournalContent);
	app.post("/api/v1/journal/:jid", journal.addEntryInJournal);
	app.get("/api/v1/journal/:jid/:oid", journal.getEntryInJournal);
	app.put("/api/v1/journal/:jid/:oid", journal.updateEntryInJournal);
	app.delete("/api/v1/journal/:jid/:oid", journal.removeEntryInJournal);

	// If no route is matched by now, it must be a 404
	app.use(function(req, res, next) {
		res.status(404);
		res.json({
			"status": 404,
			"message": "Route Not Found!"
		});
		return;
	});

	// Start listening
	app.listen(ini.web.port, function(){
		console.log("Sugarizer server listening on port " + ini.web.port + "...");
	});
}, confFile);

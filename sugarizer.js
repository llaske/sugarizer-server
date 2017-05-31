// Sugarizer server

var express = require('express'),
	settings = require('./app/config/settings'),
	activities = require('./app/routes/activities'),
	journal = require('./app/routes/journal'),
	users = require('./app/routes/users'),
	presence = require('./app/middleware/presence');


var app = express();

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
});

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

	// Register activities list API
	app.get("/activities", activities.findAll);
	app.get("/activities/:id", activities.findById);

	// Register users API
	app.get("/users", users.findAll);
	app.get("/users/:uid", users.findById);
	app.post("/users", users.addUser);
	app.put("/users/:uid", users.updateUser);

	// Register journal API
	app.get("/journal/shared", journal.findSharedJournal);
	app.get("/journal/:jid", journal.findJournalContent);
	app.get("/journal/:jid/filter/:aid", journal.findJournalContent);
	app.get("/journal/:jid/field/:field", journal.findJournalContent);
	app.get("/journal/:jid/filter/:aid/field/:field", journal.findJournalContent);
	app.post("/journal/:jid", journal.addEntryInJournal);
	app.get("/journal/:jid/:oid", journal.getEntryInJournal);
	app.put("/journal/:jid/:oid", journal.updateEntryInJournal);
	app.delete("/journal/:jid/:oid", journal.removeEntryInJournal);

	// Start listening
	app.listen(ini.web.port);
	console.log("Sugarizer server listening on port "+ini.web.port+"...");
}, confFile);

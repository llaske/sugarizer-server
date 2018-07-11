// Handle to wait for db connection
var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db;

var server;
var db;


//- Utility functions

// Init database
exports.waitConnection = function(settings, callback) {
	var waitTime = settings.database.waitdb;
	if (waitTime) {
		var timer = setInterval(function() {
			server = new Server(settings.database.server, settings.database.port, {auto_reconnect: false});
			db = new Db(settings.database.name, server, {
				w: 1
			});

			// Open the db
			db.open(function(err, db) {
				if (!err) {
					clearInterval(timer);
					db.close();
					callback();
				} else {
					console.log("Waiting for DB...");
				}
			});
		}, waitTime*1000);
	} else {
		callback();
	}
}

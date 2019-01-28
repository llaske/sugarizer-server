// Handle to wait for db connection
var mongo = require('mongodb');


//- Utility functions

// Init database
exports.waitConnection = function(settings, callback) {
	var waitTime = settings.database.waitdb;
	if (waitTime) {
		var timer = setInterval(function() {

			var client = new mongo.MongoClient(
				'mongodb://'+settings.database.server+':'+settings.database.port+'/'+settings.database.name,
				{auto_reconnect: false, w:1, useNewUrlParser: true});

			// Open the db
			client.connect(function(err, client) {
				var db = client.db(settings.database.name);
				if (!err) {
					clearInterval(timer);
					client.close();
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

// stats handling

var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = require('bson').BSONPure;

var server;
var db;

var statsCollection;

// Init database
exports.init = function(settings, callback) {
	statsCollection = settings.collections.stats;
	server = new Server(settings.database.server, settings.database.port, {auto_reconnect: true});
	db = new Db(settings.database.name, server, {w:1});

	db.open(function(err, db) {
		if(err) {
		}
		if (callback) callback();
	});
}

exports.addStats = function(req, res) {

	//parse user details
	var stats = JSON.parse(req.body.stats);

  // @TODO solve insertMany issue by updating mongodb

	db.collection(statsCollection, function (err, collection) {
			collection.insertMany(stats, {safe:true}, function(err, result) {
				if (err) {
					res.status(500);
					res.send({'error':'An error has occurred'});
				} else {
					res.send(result[0]);
				}
			});
	});
}


exports.findAll = function(req, res) {

  //get data
  db.collection(statsCollection, function(err, collection) {
    collection.find().toArray(function(err, data) {
      res.send(data);
    });
  });
};

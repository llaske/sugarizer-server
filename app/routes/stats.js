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
	server = new Server(settings.database.server, settings.database.port, {
		auto_reconnect: true
	});
	db = new Db(settings.database.name, server, {
		w: 1
	});

	db.open(function(err, db) {
		if (err) {}
		if (callback) callback();
	});
}

exports.addStats = function(req, res) {

	//validate
	if (!req.body.stats) {
		res.status(401);
		res.send({
			'error': 'Stats object not defined!'
		});
		return;
	}

	//parse user details
	var stats = JSON.parse(req.body.stats);

	db.collection(statsCollection, function(err, collection) {
		collection.insert(stats, {
			safe: true
		}, function(err, result) {
			if (err) {
				res.status(500);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				res.send(result);
			}
		});
	});
}

exports.deleteStats = function(req, res) {

	//validate
	if (!req.query.user_id) {
		res.status(401);
		res.send({
			'error': 'Invalid user id'
		});
		return;
	}

	db.collection(statsCollection, function(err, collection) {
		collection.remove({
			'user_id': req.query.user_id
		}, function(err, result) {
			if (err) {
				res.status(500);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				res.send();
			}
		});
	});
}


exports.findAll = function(req, res) {

	//form query
	var query = {};
	query = addQuery('user_id', req.query, query);
	query = addQuery('object', req.query, query);
	query = addQuery('action', req.query, query);

	//get options
	var options = getOptions(req, '+timestamp');

	//get data
	db.collection(statsCollection, function(err, collection) {
		collection.find(query, {}, options).toArray(function(err, data) {
			res.send(data);
		});
	});
};

function getOptions(req, def_sort) {

	//prepare options
	var sort_val = (typeof req.query.sort === "string" ? req.query.sort : def_sort);
	var sort_type = sort_val.indexOf("-") == 0 ? 'desc' : 'asc';
	var options = {
		sort: [
			[sort_val.substring(1), sort_type]
		]
	}
	return options;
}

//private function for filtering and sorting
function addQuery(filter, params, query, default_val) {

	//check default case
	query = query || {};

	//validate
	if (typeof params[filter] != "undefined" && typeof params[filter] === "string") {

		if (filter == 'user_id') {
			query[filter] = params[filter];
		} else {
			query[filter] = {
				$regex: new RegExp("^" + params[filter] + "$", "i")
			};
		}
	} else {
		//default case
		if (typeof default_val != "undefined") {
			query[filter] = default_val;
		}
	}

	//return
	return query;
}

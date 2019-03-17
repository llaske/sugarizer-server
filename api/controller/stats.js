// stats handling

var common = require('../../dashboard/helper/common');

var mongo = require('mongodb');

var db;
var isActive = true

var statsCollection;

// Init database
exports.init = function(settings, callback) {
	statsCollection = settings.collections.stats;
	isActive = settings.statistics.active
	var client = new mongo.MongoClient(
		'mongodb://'+settings.database.server+':'+settings.database.port+'/'+settings.database.name,
		{auto_reconnect: false, w:1, useNewUrlParser: true});

	// Open the db
	client.connect(function(err, client) {
		db = client.db(settings.database.name);
		if (err) {}
		if (callback) callback();
	});
}


/**
 * @api {post} api/v1/stats Add Stats
 * @apiName AddStats
 * @apiDescription Add stats in the database. Returns all the inserted stats.
 * @apiGroup Stats
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} user_agent User agent
 * @apiSuccess {String} user_ip User ip
 * @apiSuccess {Object} client_type Type of client (Mobile/Web)
 * @apiSuccess {String} source where the action is being performed
 * @apiSuccess {String} event_object where the action is being performed
 * @apiSuccess {String} event_action type of action
 * @apiSuccess {String} event_label label of the event
 * @apiSuccess {String} event_value value of the event
 * @apiSuccess {Number} timestamp when the stats was created by the user
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *      {
 *       "user_id"         : "592d4445cc8be9187abb284f",
 *       "user_agent"      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
 *       "user_ip"         : "122.34.42.165",
 *       "client_type"     : "mobile",
 *       "event_source"    : "sugarizer",
 *       "event_object"    : "home_view",
 *       "event_action"    : "search",
 *       "event_label"     : "q=stopwatch",
 *       "event_value"     : null,
 *       "timestamp"       : 6712375127,
 *       "_id"             : "59541db5a297accf5b9003da"
 *      }
 *    ]
 *
 **/
exports.addStats = function(req, res) {

	//check if ststs api is active
	if (!isStatsActive(req, res)) {
		return;
	}

	//validate
	if (!req.body.stats) {
		res.status(401).send({
			'error': 'Stats object not defined!',
			'code': 17
		});
		return;
	}

	//parse user details
	var stats = JSON.parse(req.body.stats);

	//add client IP
	if (stats.constructor === Array) {
		for (var i = 0; i < stats.length; i++) {
			stats[i].user_ip = common.getClientIP(req);
		}
	} else {
		stats.user_ip = common.getClientIP(req);
	}
	db.collection(statsCollection, function(err, collection) {
		collection.insertMany(stats, {
			safe: true
		}, function(err, result) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				res.send(result);
			}
		});
	});
}


/**
 * @api {delete} api/v1/stats Remove stats
 * @apiName RemoveStats
 * @apiDescription Remove all the stats for a particular user.
 * @apiGroup Stats
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} uid Unique id of the user to delete stats
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user_id": "5569f4b019e0b4c9525b3c97"
 *     }
 **/
exports.deleteStats = function(req, res) {

	//validate
	if (!req.query.uid) {
		res.status(401).send({
			'error': 'Invalid user id',
			'code': 18
		});
		return;
	}

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != req.query.uid) {
			return res.status(401).send({
				'error': 'You don\'t have permission to perform this action',
				'code': 19
			});
		}
	}

	db.collection(statsCollection, function(err, collection) {
		collection.deleteOne({
			'user_id': req.query.uid
		}, function(err, result) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				res.send({
					'user_id': req.query.uid
				});
			}
		});
	});
}

/**
 * @api {get} api/v1/stats/ Get all stats
 * @apiName GetAllStats
 * @apiDescription Retrieve all stats data registered on the server.
 * @apiGroup Stats
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key Users unique id.
 * @apiHeader {String} x-access-token Users access token.
 *
 * @apiParam {String} [uid] ID of the user
 * @apiParam {String} [event_source] Name of the Event Source
 * @apiParam {String} [event_object] Name of the Event Object
 * @apiParam {String} [event_action] Name of the Event Action
 * @apiParam {String} [client_type] Client type <code>e.g. client_type=App or client_type=Web App</code>
 * @apiParam {String} [sort=+timestamp] Order of results <code>e.g. sort=-action or sort=+timestamp</code>
 *
 * @apiExample Example usage:
 *     "/api/v1/stats"
 *     "/api/v1/stats?user_id=592d4445cc8be9187abb284f"
 *     "/api/v1/stats?event_object=home_view"
 *     "/api/v1/stats?user_id=592d4445cc8be9187abb284f&sort=-timestamp"
 *
 * @apiSuccess {Object[]} stats
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *       "user_id"         : "592d4445cc8be9187abb284f",
 *       "user_agent"      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
 *       "user_ip"         : "122.34.42.165",
 *       "client_type"     : "App",
 *       "event_source"    : "sugarizer",
 *       "event_object"    : "home_view",
 *       "event_action"    : "search",
 *       "event_label"     : "q=stopwatch",
 *       "event_value"     : null,
 *       "timestamp"       : 6712375127,
 *       "_id"             : "59541db5a297accf5b9003da"
 *      }
 *      ...
 *     ]
 **/
exports.findAll = function(req, res) {

	//form query
	var query = {};
	query = addQuery('uid', req.query, query);
	query = addQuery('client_type', req.query, query);
	query = addQuery('event_source', req.query, query);
	query = addQuery('event_object', req.query, query);
	query = addQuery('event_action', req.query, query);
	query = addQuery('event_label', req.query, query);

	//get options
	var options = getOptions(req, '+timestamp');

	//get data
	db.collection(statsCollection, function(err, collection) {
		collection.find(query, options).toArray(function(err, data) {
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

		if (filter == 'uid') {
			query['user_id'] = params[filter];
		} else if (filter == 'client_type') {
			query['client_type'] = params[filter];
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

//check active status of status api
function isStatsActive(req, res) {
	if (!isActive) {
		res.status(401).send({
			'error': 'Statistics API is inactive',
			'code': 20
		});
		return false;
	}
	return true;
}

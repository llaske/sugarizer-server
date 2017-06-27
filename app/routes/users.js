// User handling

var mongo = require('mongodb'),
	journal = require('./journal');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server;
var db;

var usersCollection;

// Init database
exports.init = function(settings, callback) {
	usersCollection = settings.collections.users;
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

/**
 * @api {get} api/v1/users/:id Get user detail
 * @apiName GetUser
 * @apiDescription Retrieve detail for a specific user.
 * @apiGroup Users
 * @apiVersion 0.6.5
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} timestamp when the user was created on the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tarun",
 *       "role": "student",
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [
 *          "org.olpcfrance.Abecedarium",
 *          "org.sugarlabs.ChatPrototype",
 *          "org.sugarlabs.Clock",
 *          "org.olpcfrance.FoodChain",
 *          "org.sugarlabs.GearsActivity",
 *          "org.sugarlabs.GTDActivity",
 *          "org.olpcfrance.Gridpaint",
 *          "org.olpc-france.LOLActivity",
 *          "org.sugarlabs.Markdown",
 *          "org.sugarlabs.MazeWebActivity",
 *          "org.sugarlabs.PaintActivity"
 *       ],
 *       "language": "en",
 *       "password": "xxx",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.findById = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id'
		});
		return;
	}
	db.collection(usersCollection, function(err, collection) {
		collection.findOne({
			'_id': new BSON.ObjectID(req.params.uid)
		}, function(err, item) {
			res.send(item);
		});
	});
};

/**
 * @api {get} api/v1/users/ Get all users
 * @apiName GetAllUsers
 * @apiDescription Retrieve all users registered on the server. Query params can be mixed and match to achieve suitable results.
 * @apiGroup Users
 * @apiVersion 0.6.5
 *
 * @apiExample {curl} Example usage:
 *     /api/v1/users
 *     /api/v1/users?name=tarun
 *     /api/v1/users?language=fr&sort=+name
 *     /api/v1/users?sort=+name&limit=5&offset=20
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} [name] Display name of the activity <code>e.g. name=paint</code>
 * @apiParam {Boolean} [language] To get users of specific language <code>e.g. language=fr</code>
 * @apiParam {String} [role=student] To filter users based on role <code>e.g. role=admin or role= student</code>
 * @apiParam {String} [q] Fuzzy Search <code>e.g. q=tar</code> to search user with name "Tarun"
 * @apiParam {String} [sort=+name] Order of results <code>e.g. sort=-name or sort=+role</code>
 * @apiParam {String} [offset=0] Offset in results <code>e.g. offset=15</code>
 * @apiParam {String} [limit=10] Limit results <code>e.g. limit=5</code>
 *
 * @apiSuccess {Object[]} users List of users
 * @apiSuccess {Number} offset Offset in users list
 * @apiSuccess {Number} limit Limit on number of results
 * @apiSuccess {Number} total total number of results
 * @apiSuccess {String} sort information about sorting used in the results
 * @apiSuccess {Object} link pagination links
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     "users":[
 *       {
 *         "name": "Tarun Singhal",
 *         "role": "student",
 *         "color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         },
 *         "favorites": [
 *           "org.sugarlabs.GearsActivity",
 *           "org.sugarlabs.MazeWebActivity",
 *         ],
 *         "language": "en",
 *         "password": "xxx",
 *         "private_journal": "5569f4b019e0b4c9525b3c96",
 *         "shared_journal": "536d30874326e55f2a22816f",
 *         "timestamp": 1423341000747,
 *         "_id": "536dd30aadcd557f2a9d648b"
 *      },
 *      ...
 *     ],
 *     "limit": 10,
 *     "offset": 20,
 *     "total": 200,
 *     "sort": "+name",
 *     "links": {
 *     	"next_page": "/api/v1/users?limit=10&offset=10",
 *     	"next_page": "/api/v1/users?limit=10&offset=30"
 *     }
 *    }
 **/
exports.findAll = function(req, res) {

	//prepare condition
	var query = {};
	query = addQuery('name', req.query, query);
	query = addQuery('language', req.query, query);
	query = addQuery('role', req.query, query, 'student');
	query = addQuery('q', req.query, query)

	// add filter and pagination
	db.collection(usersCollection, function(err, collection) {

		//count data
		collection.count(query, function(err, count) {

			//define var
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var options = getOptions(req, count, "+name");

			//get data
			exports.getAllUsers(query, options, function(users) {

				//add pagination
				var data = {
					'users': users,
					'offset': options.skip,
					'limit': options.limit,
					'total': options.total,
					'sort': (options.sort[0][0] + '(' + options.sort[0][1] + ')'),
					'links': {
						'prev_page': ((options.skip - options.limit) >= 0) ? formPaginatedUrl(route, params, (options.skip - options.limit), options.limit) : undefined,
						'next_page': ((options.skip + options.limit) < options.total) ? formPaginatedUrl(route, params, (options.skip + options.limit), options.limit) : undefined,
					},
				}

				// Return
				res.send(data);
			});
		})
	});
};

//form query params
function formPaginatedUrl(route, params, offset, limit) {
	//set params
	params.offset = offset;
	params.limit = limit;
	var str = [];
	for (var p in params)
		if (params.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
		}
	return route + '?' + str.join("&");
}

//get all users
exports.getAllUsers = function(query, options, callback) {

	//get data
	db.collection(usersCollection, function(err, collection) {

		//get users
		var users = collection.find(query);

		//skip sort limit
		if (options.sort) users.sort(options.sort);
		if (options.skip) users.skip(options.skip);
		if (options.limit) users.limit(options.limit);

		//return
		users.toArray(function(err, users) {
			callback(users);
		});
	});
}

function getOptions(req, count, def_sort) {

	//prepare options
	var sort_val = (typeof req.query.sort === "string" ? req.query.sort : def_sort);
	var sort_type = sort_val.indexOf("-") == 0 ? 'desc' : 'asc';
	var options = {
		sort: [
			[sort_val.substring(1), sort_type]
		],
		skip: req.query.offset || 0,
		total: count,
		limit: req.query.limit || 10
	}

	//cast to int
	options.skip = parseInt(options.skip);
	options.limit = parseInt(options.limit);

	//return
	return options;
}

//private function for filtering and sorting
function addQuery(filter, params, query, default_val) {

	//check default case
	query = query || {};

	//validate
	if (typeof params[filter] != "undefined" && typeof params[filter] === "string") {

		if (filter == 'q') {
			query['name'] = {
				$regex: new RegExp(params[filter], "i")
			};
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


/**
 * @api {post} api/v1/users/ Add user
 * @apiName AddUser
 * @apiDescription Add a new user. Return the user created.
 * @apiGroup Users
 * @apiVersion 0.6.5
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} timestamp when the user was created on the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tarun",
 *       "role": "student",
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [
 *          "org.olpcfrance.Abecedarium",
 *          "org.sugarlabs.ChatPrototype",
 *          "org.sugarlabs.Clock",
 *          "org.olpcfrance.FoodChain",
 *          "org.sugarlabs.GearsActivity",
 *          "org.sugarlabs.GTDActivity",
 *          "org.olpcfrance.Gridpaint",
 *          "org.olpc-france.LOLActivity",
 *          "org.sugarlabs.Markdown",
 *          "org.sugarlabs.MazeWebActivity",
 *          "org.sugarlabs.PaintActivity"
 *       ],
 *       "language": "en",
 *       "password": "xxx",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.addUser = function(req, res) {

	//validate
	if (!req.body.user) {
		res.status(401).send({
			'error': 'User object not defined!'
		});
		return;
	}

	//parse user details
	var user = JSON.parse(req.body.user);

	//add timestamp & language
	user.timestamp = +new Date();
	user.role = user.role || 'student';

	//validation for fields [password, name]
	if (!user.password || !user.name) {
		res.status(401).send({
			"message": "Invalid user object!"
		});
	}

	//check if user already exist
	exports.getAllUsers({
		'name': new RegExp("^" + user.name + "$", "i")
	}, {}, function(item) {
		if (item.length == 0) {
			//create user based on role
			if (user.role == 'admin') {
				db.collection(usersCollection, function(err, collection) {
					collection.insert(user, {
						safe: true
					}, function(err, result) {
						if (err) {
							res.status(500).send({
								'error': 'An error has occurred'
							});
						} else {
							res.send(result[0]);
						}
					});
				});
			} else {
				//for student
				db.collection(usersCollection, function(err, collection) {
					// Create a new journal
					journal.createJournal(function(err, result) {
						// add journal to the new user
						user.private_journal = result[0]._id;
						user.shared_journal = journal.getShared()._id;
						collection.insert(user, {
							safe: true
						}, function(err, result) {
							if (err) {
								res.status(500).send({
									'error': 'An error has occurred'
								});
							} else {
								res.send(result[0]);
							}
						});
					});
				});
			}

		} else {
			res.status(401).send({
				'error': 'User with same name already exist'
			});
		}
	});
}

/**
 * @api {put} api/v1/users/ Update user
 * @apiName UpdateUser
 * @apiDescription Update an user. Return the user updated.
 * @apiGroup Users
 * @apiVersion 0.6.5
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.strike Buddy strike color
 * @apiSuccess {String} color.file Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} timestamp when the user was created on the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tarun",
 *       "role": "student",
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [
 *          "org.olpcfrance.Abecedarium",
 *          "org.sugarlabs.ChatPrototype",
 *          "org.sugarlabs.Clock",
 *          "org.olpcfrance.FoodChain",
 *          "org.sugarlabs.GearsActivity",
 *          "org.sugarlabs.GTDActivity",
 *          "org.olpcfrance.Gridpaint",
 *          "org.olpc-france.LOLActivity",
 *          "org.sugarlabs.Markdown",
 *          "org.sugarlabs.MazeWebActivity",
 *          "org.sugarlabs.PaintActivity"
 *       ],
 *       "language": "en",
 *       "password": "xxx",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.updateUser = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id'
		});
		return;
	}

	//validate
	if (!req.body.user) {
		res.status(401).send({
			'error': 'User object not defined!'
		});
		return;
	}

	var uid = req.params.uid;
	var user = JSON.parse(req.body.user);

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != uid) {
			res.status(401).send({
				'error': 'You don\'t have permission to perform this action'
			});
			return;
		}
	}

	//do not update name if already exist
	if (typeof user.name !== 'undefined') {
		//check for unique user name validation
		exports.getAllUsers({
			'_id': {
				$ne: new BSON.ObjectID(uid)
			},
			'name': new RegExp("^" + user.name + "$", "i")
		}, {}, function(item) {
			if (item.length == 0) {

				//update user
				updateUser(uid, user, res);
			} else {
				res.status(401).send({
					'error': 'User with same name already exist'
				});
			}
		});
	} else {
		//update user
		updateUser(uid, user, res);
	}
}

//private function to update user
function updateUser(uid, user, res) {
	db.collection(usersCollection, function(err, collection) {
		collection.update({
			'_id': new BSON.ObjectID(uid)
		}, {
			$set: user
		}, {
			safe: true
		}, function(err, result) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred'
				});
			} else {
				if (result) {
					res.send(user);
				} else {
					res.status(401).send({
						'error': 'Inexisting user id'
					});
				}
			}
		});
	});
}

/**
 * @api {delete} api/v1/users/:uid Remove user
 * @apiName RemoveUser
 * @apiDescription Remove an user from the database.
 * @apiGroup Users
 * @apiVersion 0.6.5
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} uid Unique id of the user to delete
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user_id": "5569f4b019e0b4c9525b3c97"
 *     }
 **/
exports.removeUser = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id'
		});
		return;
	}

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != req.params.uid) {
			res.status(401).send({
				'error': 'You don\'t have permission to perform this action'
			});
			return;
		}
	}
	//delete user from db
	var uid = req.params.uid;
	db.collection(usersCollection, function(err, collection) {
		collection.remove({
			'_id': new BSON.ObjectID(uid)
		}, function(err, result) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred'
				});
			} else {
				if (result) {
					res.send({
						'user_id': uid
					});
				} else {
					res.status(401).send({
						'error': 'Inexisting user id'
					});
				}
			}
		});
	});
}

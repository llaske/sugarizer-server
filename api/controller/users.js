// User handling

var mongo = require('mongodb'),
	journal = require('./journal');

var db;

var usersCollection;
var classroomsCollection;
var journalCollection;

// Init database
exports.init = function(settings, database) {
	usersCollection = settings.collections.users;
	classroomsCollection = settings.collections.classrooms;
	journalCollection = settings.collections.journal;
	db = database;
};

/**
 * @api {get} api/v1/users/:id Get user detail
 * @apiName GetUser
 * @apiDescription Retrieve detail for a specific user.
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.stroke Buddy strike color
 * @apiSuccess {String} color.fill Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} created_time when the user was created on the server
 * @apiSuccess {Number} timestamp when the user last accessed the server
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
 *       "created_time": 1423341000747,
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.findById = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id',
			'code': 18
		});
		return;
	}
	db.collection(usersCollection, function(err, collection) {
		collection.findOne({
			'_id': new mongo.ObjectID(req.params.uid)
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
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/users"
 *     "/api/v1/users?name=tarun"
 *     "/api/v1/users?language=fr&sort=+name"
 *     "/api/v1/users?sort=+name&limit=5&offset=20"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} [name] Display name of the activity <code>e.g. name=paint</code>
 * @apiParam {Boolean} [language] To get users of specific language <code>e.g. language=fr</code>
 * @apiParam {String} [role=student] To filter users based on role <code>e.g. role=admin or role= student</code>
 * @apiParam {String} [q] Fuzzy Search <code>e.g. q=tar</code> to search user with name "Tarun"
 * @apiParam {Number} [stime] results starting from stime in ms <code>e.g. stime=712786812367</code>
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
 *         "created_time": 1423341000747,
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
 *     	"prev_page": "/api/v1/users?limit=10&offset=10",
 *     	"next_page": "/api/v1/users?limit=10&offset=30"
 *     }
 *    }
 **/
exports.findAll = function(req, res) {

	//prepare condition
	var query = {};
	query = addQuery('name', req.query, query);
	query = addQuery('classid', req.query, query);
	query = addQuery('language', req.query, query);
	query = addQuery('role', req.query, query, 'student');
	query = addQuery('q', req.query, query);
	if (req.query.stime) {
		query['timestamp'] = {
			'$gte': parseInt(req.query.stime)
		};
	}

	// add filter and pagination
	db.collection(usersCollection, function(err, collection) {

		//count data
		collection.countDocuments(query, function(err, count) {

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
				};

				// Return
				res.send(data);
			});
		});
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
			str.push((p) + "=" + (params[p]));
		}
	return '?' + str.join("&");
}

//get all users
exports.getAllUsers = function(query, options, callback) {

	//get data
	db.collection(usersCollection, function(err, collection) {

		//get users
		collection.find(query, function(err, users) {

			//skip sort limit
			if (options.sort) users.sort(options.sort);
			if (options.skip) users.skip(options.skip);
			if (options.limit) users.limit(options.limit);

			//return
			users.toArray(function(err, usersList) {
				callback(usersList);
			});
		});
	});
};

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
	};

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
		} else if (filter == 'classid') {
			query['_id'] = {
				$in: params[filter].split(',').map(function(id) {
					return new mongo.ObjectID(id);
				})
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
 * @apiDescription Add a new user. Return the user created. Only admin can add another admin or student.
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.stroke Buddy strike color
 * @apiSuccess {String} color.fill Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} created_time when the user was created on the server
 * @apiSuccess {Number} timestamp when the user last accessed the server
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
 *       "created_time": 1423341000747,
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.addUser = function(req, res) {

	//validate
	if (!req.body.user) {
		res.status(401).send({
			'error': 'User object not defined!',
			'code': 21
		});
		return;
	}

	//parse user details
	var user = JSON.parse(req.body.user);

	//add timestamp & language
	user.created_time = +new Date();
	user.timestamp = +new Date();
	user.role = (user.role ? user.role.toLowerCase() : 'student');

	//validation for fields [password, name]
	if (!user.password || !user.name) {
		res.status(401).send({
			'error': "Invalid user object!",
			'code': 2
		});
	}

	// validate on the basis of user's role for logged in case
	if (req.user) {
		if (req.user.role == 'student') {
			return res.status(401).send({
				'error': 'You don\'t have permission to perform this action',
				'code': 19
			});
		}
	}

	//check if user already exist
	exports.getAllUsers({
		'name': new RegExp("^" + user.name + "$", "i")
	}, {}, function(item) {
		if (item.length == 0) {
			//create user based on role
			if (user.role == 'admin') {
				db.collection(usersCollection, function(err, collection) {
					collection.insertOne(user, {
						safe: true
					}, function(err, result) {
						if (err) {
							res.status(500).send({
								'error': 'An error has occurred',
								'code': 10
							});
						} else {
							res.send(result.ops[0]);
						}
					});
				});
			} else {
				//for student
				db.collection(usersCollection, function(err, collection) {
					// Create a new journal
					journal.createJournal(function(err, result) {
						// add journal to the new user
						user.private_journal = result.ops[0]._id;
						user.shared_journal = journal.getShared()._id;
						collection.insertOne(user, {
							safe: true
						}, function(err, result) {
							if (err) {
								res.status(500).send({
									'error': 'An error has occurred',
									'code': 10
								});
							} else {
								res.send(result.ops[0]);
							}
						});
					});
				});
			}

		} else {
			res.status(401).send({
				'error': 'User with same name already exist',
				'code': 22
			});
		}
	});
};

/**
 * @api {put} api/v1/users/ Update user
 * @apiName UpdateUser
 * @apiDescription Update an user. Return the user updated. Student can update only his/her details but admin can update anyone.
 * @apiGroup Users
 * @apiVersion 1.0.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name Unique user name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.stroke Buddy strike color
 * @apiSuccess {String} color.fill Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} created_time when the user was created on the server
 * @apiSuccess {Number} timestamp when the user last accessed the server
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
 *       "created_time": 1423341000747,
 *       "timestamp": 1423341001747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 **/
exports.updateUser = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id',
			'code': 18
		});
		return;
	}

	//validate
	if (!req.body.user) {
		res.status(401).send({
			'error': 'User object not defined!',
			'code': 21
		});
		return;
	}

	var uid = req.params.uid;
	var user = JSON.parse(req.body.user);

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != uid) {
			res.status(401).send({
				'error': 'You don\'t have permission to perform this action',
				'code': 19
			});
			return;
		}
	}

	//do not update name if already exist
	if (typeof user.name !== 'undefined') {
		//check for unique user name validation
		exports.getAllUsers({
			'_id': {
				$ne: new mongo.ObjectID(uid)
			},
			'name': new RegExp("^" + user.name + "$", "i")
		}, {}, function(item) {
			if (item.length == 0) {

				//update user
				updateUser(uid, user, res);
			} else {
				res.status(401).send({
					'error': 'User with same name already exist',
					'code': 22
				});
			}
		});
	} else {
		//update user
		updateUser(uid, user, res);
	}
};

//private function to update user
function updateUser(uid, user, res) {
	db.collection(usersCollection, function(err, collection) {
		collection.updateOne({
			'_id': new mongo.ObjectID(uid)
		}, {
			$set: user
		}, {
			safe: true
		}, function(err, result) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				if (result && result.result && result.result.n == 1) {
					db.collection(usersCollection, function(err, collection) {
						collection.findOne({
							'_id': new mongo.ObjectID(uid)
						}, function(err, user) {
							res.send(user);
						});
					});
				} else {
					res.status(401).send({
						'error': 'Inexisting user id',
						'code': 23
					});
				}
			}
		});
	});
}

/**
 * @api {delete} api/v1/users/:uid Remove user
 * @apiName RemoveUser
 * @apiDescription Remove an user from the database. Only admin can remove other users. Self removal can also be done.
 * @apiGroup Users
 * @apiVersion 1.0.0
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
	if (!mongo.ObjectID.isValid(req.params.uid)) {
		res.status(401).send({
			'error': 'Invalid user id',
			'code': 18
		});
		return;
	}

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != req.params.uid) {
			res.status(401).send({
				'error': 'You don\'t have permission to perform this action',
				'code': 19
			});
			return;
		}
	}

	//delete user from db
	var uid = req.params.uid;
	db.collection(usersCollection, function(err, collection) {
		collection.findOneAndDelete({
			'_id': new mongo.ObjectID(uid)
		}, function(err, user) {
			if (err) {
				res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				if (user && user.ok && user.value) {
					// Remove user form classroom
					db.collection(classroomsCollection, function(err, collection) {
						collection.updateMany({},
							{
								$pull: { students: uid}
							}, {
								safe: true
							},
							function(err) {
								if (err) {
									res.status(500).send({
										error: "An error has occurred",
										code: 10
									});
								} else {
									if (user.value.private_journal) {
										db.collection(journalCollection, function(err, collection) {
											collection.deleteMany({
												_id: new mongo.ObjectID(user.value.private_journal)
											}, {
												safe: true
											},
											function(err) {
												if (err) {
													res.status(500).send({
														error: "An error has occurred",
														code: 10
													});
												} else {
													res.send({
														'user_id': uid
													});
												}
											}
											);
										});
									} else {
										res.send({
											'user_id': uid
										});
									}
								}
							}
						);
					});
				} else {
					res.status(401).send({
						'error': 'Inexisting user id',
						'code': 23
					});
				}
			}
		});
	});
};

//update user's time stamp
exports.updateUserTimestamp = function(uid, callback) {

	db.collection(usersCollection, function(err, collection) {
		collection.updateOne({
			'_id': new mongo.ObjectID(uid)
		}, {
			$set: {
				timestamp: +new Date()
			}
		}, {
			safe: true
		}, function(err) {
			callback(err);
		});
	});
};

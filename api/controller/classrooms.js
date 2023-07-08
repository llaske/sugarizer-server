// classrooms handling

var mongo = require("mongodb"),
	users = require("./users");

var db;

var classroomsCollection;

// Init database
exports.init = function(settings, database) {
	classroomsCollection = settings.collections.classrooms;
	db = database;
};

/**
 * @api {post} api/v1/classrooms Add classroom
 * @apiName Addclassroom
 * @apiDescription Add classroom in the database. Returns the inserted classroom.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f,...],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 *    ]
 *
 **/
exports.addClassroom = function(req, res) {
	//validate
	if (!req.body.classroom) {
		res.status(401).send({
			error: "Classroom object not defined!",
			code: 22
		});
		return;
	}

	//parse user details
	var classroom = JSON.parse(req.body.classroom);

	//add timestamp & language
	classroom.created_time = +new Date();
	classroom.timestamp = +new Date();

	//check if classroom already exist
	db.collection(classroomsCollection, function(err, collection) {

		//count data
		collection.countDocuments({
			'name': new RegExp("^" + classroom.name + "$", "i")
		}, function(err, count) {
			if (count == 0) {
				// store
				db.collection(classroomsCollection, function(err, collection) {
					collection.insertOne(
						classroom,
						{
							safe: true
						},
						function(err, result) {
							if (err) {
								res.status(500).send({
									error: "An error has occurred",
									code: 10
								});
							} else {
								res.send(result.ops[0]);
							}
						}
					);
				});
			} else {
				res.status(401).send({
					'error': 'Classroom with same name already exists',
					'code': 30
				});
			}
		});
	});
};

/**
 * @api {delete} api/v1/classrooms/:id  Remove classroom
 * @apiName RemoveClassroom
 * @apiDescription Remove the classroom by id.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} id Unique id of the classroom to delete
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "5569f4b019e0b4c9525b3c97"
 *     }
 **/
exports.removeClassroom = function(req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.classid)) {
		res.status(401).send({
			error: "Invalid classroom id",
			code: 23
		});
		return;
	}

	db.collection(classroomsCollection, function(err, collection) {
		collection.deleteOne(
			{
				_id: new mongo.ObjectID(req.params.classid)
			},
			function(err, result) {
				if (err) {
					res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						res.send({
							id: req.params.classid
						});
					} else {
						res.status(401).send({
							error: "Inexisting classroom id",
							code: 23
						});
					}
				}
			}
		);
	});
};

/**
 * @api {get} api/v1/classrooms/ Get all classrooms
 * @apiName GetAllclassrooms
 * @apiDescription Retrieve all classrooms data registered on the server.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiExample Example usage:
 *     "/api/v1/classrooms"
 *
 * @apiSuccess {Object[]} classrooms
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "classrooms":[
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [592d4445cc8be9187abb284f, 592d4445cc8be9187abb284f, ...],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      },
 *      ...
 *     ],
 *     "limit": 10,
 *     "offset": 20,
 *     "total": 200,
 *     "sort": "+name",
 *     "links": {
 *     	"prev_page": "/api/v1/classrooms?limit=10&offset=10",
 *     	"next_page": "/api/v1/classrooms?limit=10&offset=30"
 *     }
 *    }
 **/
exports.findAll = function(req, res) {
	//prepare condition
	var query = {};
	query = addQuery("q", req.query, query);

	if (req.user && req.user.role == "teacher") {
		query['_id'] = {
			$in: req.user.classrooms.map(function(id) {
				return new mongo.ObjectID(id);
			})
		};
	}


	// add filter and pagination
	db.collection(classroomsCollection, function(err, collection) {
		//count data
		collection.countDocuments(query, function(err, count) {
			//define var
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var options = getOptions(req, count, "+name");

			var conf = [
				{
					$match: query
				},
				{
					$project: {
						name: 1,
						students: 1,
						color: 1,
						options: 1,
						created_time: 1,
						timestamp: 1,
						insensitive: { "$toLower": "$name" }
					}
				},
				{ 
					$sort: {
						"insensitive": 1
					}
				}
			];
	
			if (typeof options.sort == 'object' && options.sort.length > 0 && options.sort[0] && options.sort[0].length >= 2) {
				conf[1]["$project"]["insensitive"] = { "$toLower": "$" + options.sort[0][0] };
	
				if (options.sort[0][1] == 'desc') {
					conf[2]["$sort"] = {
						"insensitive": -1
					};
				} else {
					conf[2]["$sort"] = {
						"insensitive": 1
					};
				}
			}
	
			collection.aggregate(conf, function (err, classroom) {
				if (options.skip) classroom.skip(options.skip);
				if (options.limit) classroom.limit(options.limit);
				//return
				classroom.toArray(function(err, classrooms) {
					//add pagination
					var data = {
						classrooms: classrooms,
						offset: options.skip,
						limit: options.limit,
						total: options.total,
						sort: options.sort[0][0] + "(" + options.sort[0][1] + ")",
						links: {
							prev_page: (options.skip - options.limit >= 0) ? formPaginatedUrl(route, params, options.skip - options.limit, options.limit) : undefined,
							next_page: (options.skip + options.limit < options.total) ? formPaginatedUrl(route, params, options.skip + options.limit, options.limit) : undefined
						}
					};
					// Return
					res.send(data);
				});
			});
		});
	});
};

/**
 * @api {get} api/v1/classrooms/:id Get classroom detail
 * @apiName GetClassroom
 * @apiDescription Retrieve detail for a specific classroom.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} id Unique classroom id
 * 
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [
 *     		{
 *       		"name": "Tarun",
 *       		"role": "student",
 *       		"color": {
 *       		  "stroke": "#00A0FF",
 *       		  "fill": "#00B20D"
 *       		},
 *       		"favorites": [
 *         		 	"org.olpcfrance.Abecedarium",
 *         		 	"org.sugarlabs.ChatPrototype",
 *         		 	"org.sugarlabs.Clock",
 *         		 	"org.olpcfrance.FoodChain",
 *         		 	"org.sugarlabs.GearsActivity",
 *         		 	"org.sugarlabs.GTDActivity",
 *         		 	"org.olpcfrance.Gridpaint",
 *          		"org.olpc-france.LOLActivity",
 *          		"org.sugarlabs.Markdown",
 *          		"org.sugarlabs.MazeWebActivity",
 *          		"org.sugarlabs.PaintActivity"
 *       		],
 *       		"language": "en",
 *       		"password": "xxx",
 *       		"private_journal": "5569f4b019e0b4c9525b3c96",
 *       		"shared_journal": "536d30874326e55f2a22816f",
 *       		"created_time": 1423341000747,
 *       		"timestamp": 1423341001747,
 *       		"_id": "5569f4b019e0b4c9525b3c97"
 *    		},
 * 			...
 * 		],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 **/
exports.findById = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.classid)) {
		res.status(401).send({
			error: "Invalid classroom id",
			code: 23
		});
		return;
	}
	db.collection(classroomsCollection, function(err, collection) {
		collection.findOne(
			{
				_id: new mongo.ObjectID(req.params.classid)
			},
			function(err, classroom) {
				if (!classroom) {
					res.status(401).send({});
					return;
				}

				users.getAllUsers(
					{
						_id: {
							$in: classroom.students.map(function(id) {
								return new mongo.ObjectID(id);
							})
						},
						role: 'student'
					},
					{},
					function(users) {
						// append students
						classroom.students = users;
						res.send(classroom);
					}
				);
			}
		);
	});
};

/**
 * @api {put} api/v1/classrooms/:id Update classroom
 * @apiName UpdateClassroom
 * @apiDescription Update an classroom. Return the classroom updated.
 * @apiGroup Classrooms
 * @apiVersion 1.1.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} id Unique classroom id
 * 
 * @apiSuccess {String} _id Unique classroom id
 * @apiSuccess {String} name classroom name
 * @apiSuccess {Object} color classroom color
 * @apiSuccess {String} color.stroke classroom strike color
 * @apiSuccess {String} color.fill classroom fill color
 * @apiSuccess {Array} students List of students
 * @apiSuccess {Number} created_time when the classroom was created on the server
 * @apiSuccess {Number} timestamp when the classroom last accessed the server
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *       "_id"         : "592d4445cc8be9187abb284f",
 *       "name"        : "Group A",
 *       "color": {
 *         "stroke"	   : "#00A0FF",
 *         "fill"      : "#00B20D"
 *       },
 *       "students"     : [
 *     		{
 *       		"name": "Tarun",
 *       		"role": "student",
 *       		"color": {
 *       		  "stroke": "#00A0FF",
 *       		  "fill": "#00B20D"
 *       		},
 *       		"favorites": [
 *         		 	"org.olpcfrance.Abecedarium",
 *         		 	"org.sugarlabs.ChatPrototype",
 *         		 	"org.sugarlabs.Clock",
 *         		 	"org.olpcfrance.FoodChain",
 *         		 	"org.sugarlabs.GearsActivity",
 *         		 	"org.sugarlabs.GTDActivity",
 *         		 	"org.olpcfrance.Gridpaint",
 *          		"org.olpc-france.LOLActivity",
 *          		"org.sugarlabs.Markdown",
 *          		"org.sugarlabs.MazeWebActivity",
 *          		"org.sugarlabs.PaintActivity"
 *       		],
 *       		"language": "en",
 *       		"password": "xxx",
 *       		"private_journal": "5569f4b019e0b4c9525b3c96",
 *       		"shared_journal": "536d30874326e55f2a22816f",
 *       		"created_time": 1423341000747,
 *       		"timestamp": 1423341001747,
 *       		"_id": "5569f4b019e0b4c9525b3c97"
 *    		},
 * 			...
 * 		],
 *       "created_time"    : 6712213121,
 *       "timestamp"       : 6712375127,
 *      }
 **/
exports.updateClassroom = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.classid)) {
		res.status(401).send({
			error: "Invalid classroom id",
			code: 23
		});
		return;
	}

	//validate
	if (!req.body.classroom) {
		res.status(401).send({
			error: "Classroom object not defined!",
			code: 22
		});
		return;
	}

	var classid = req.params.classid;
	var classroom = JSON.parse(req.body.classroom);

	//add timestamp & language
	classroom.timestamp = +new Date();

	//check for unique classroom name validation
	db.collection(classroomsCollection, function(err, collection) {

		//count data
		collection.countDocuments({
			'_id': {
				$ne: new mongo.ObjectID(classid)
			},
			'name': new RegExp("^" + classroom.name + "$", "i")
		}, function(err, count) {
			if (count == 0) {
				//update the classroom
				db.collection(classroomsCollection, function(err, collection) {
					collection.updateOne(
						{
							_id: new mongo.ObjectID(classid)
						},
						{
							$set: classroom
						},
						{
							safe: true
						},
						function(err, result) {
							if (err) {
								res.status(500).send({
									error: "An error has occurred",
									code: 10
								});
							} else {
								if (result && result.result && result.result.n == 1) {
									collection.findOne(
										{
											_id: new mongo.ObjectID(classid)
										},
										function(err, classroomResponse) {
											// get student mappings
											users.getAllUsers(
												{
													_id: {
														$in: classroomResponse.students.map(function(id) {
															return new mongo.ObjectID(id);
														})
													}
												},
												{},
												function(users) {
													// append students
													classroomResponse.students = users;
	
													// return
													res.send(classroomResponse);
												}
											);
										}
									);
								} else {
									res.status(401).send({
										error: "Inexisting classroom id",
										code: 23
									});
								}
							}
						}
					);
				});
			} else {
				res.status(401).send({
					'error': 'Classroom with same name already exists',
					'code': 30
				});
			}
		});
	});
};

//private function for filtering and sorting
function getOptions(req, count, def_sort) {
	//prepare options
	var sort_val = typeof req.query.sort === "string" ? req.query.sort : def_sort;
	var sort_type = sort_val.indexOf("-") == 0 ? "desc" : "asc";
	var options = {
		sort: [[sort_val.substring(1), sort_type]],
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

function addQuery(filter, params, query, default_val) {
	//check default case
	query = query || {};

	//validate
	if (
		typeof params[filter] != "undefined" &&
		typeof params[filter] === "string"
	) {
		if (filter == "q") {
			query["name"] = {
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

//form query params
function formPaginatedUrl(route, params, offset, limit) {
	//set params
	params.offset = offset;
	params.limit = limit;
	var str = [];
	for (var p in params)
		if (p && Object.prototype.hasOwnProperty.call(params, p)) {
			str.push(p + "=" + params[p]);
		}
	return "?" + str.join("&");
}

exports.findStudents = function(classID) {
	return new Promise(function(resolve, reject) {
		if (!mongo.ObjectID.isValid(classID)) {
			resolve([]);
		} else {
			db.collection(classroomsCollection, function(err, collection) {
				if (err) {
					reject(err);
				} else {
					collection.findOne(
						{
							_id: new mongo.ObjectID(classID)
						},
						function(err, classroom) {
							if (err) {
								reject(err);
							} else if (!classroom || typeof classroom.students != "object" || classroom.students.length == 0) {
								resolve([]);
							} else {
								// get student mappings
								users.getAllUsers({
									role: 'student',
									_id: {
										$in: classroom.students.map(function(id) {
											return new mongo.ObjectID(id);
										})
									}
								}, {}, function(list) {
									resolve(list);
								});
							}
						}
					);
				}
			});
		}
	});
};

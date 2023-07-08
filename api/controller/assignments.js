//assignments handling 

var mongo = require('mongodb');
var journal = require('./journal');
var common = require('./utils/common');

var db;
var assignmentCollection;
var journalCollection;
var classroomCollection;

exports.init = function (settings, database) {
	assignmentCollection = settings.collections.assignments;
	journalCollection = settings.collections.journal;
	classroomCollection = settings.collections.classrooms;
	db = database;
};

var CHUNKS_COLL;
var bucket = 'textBucket';
CHUNKS_COLL = bucket + ".chunks";

/**
 * @api {post} api/v1/assignments Add assignment
 * @apiName AddAssignment
 * @apiDescription Add assignment in the database. Returns the inserted assignment.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * 
 * @apiSuccess {String} _id Unique assignment id.
 * @apiSuccess {String} name Assignment name.
 * @apiSuccess {Number} dueDate Assignment due date.
 * @apiSuccess {String} assignedWork Assignment assigned work.
 * @apiSuccess {String} instructions Assignment instructions.
 * @apiSuccess {Boolean} lateTurnIn Assignment late turn in.
 * @apiSuccess {Number} created_time Assignment created time.
 * @apiSuccess {Array} classrooms Assignment assigned to classrooms.
 * @apiSuccess {Object} options Assignment options.
 * @apiSuccess {String} created_by Assignment created by.
 * @apiSuccess {Number} timestamp Assignment timestamp.
 * @apiSuccess {Boolean} isAssigned Assignment is assigned.
 * @apiSuccess {String} journal_id Assignment journal id.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *   {
        "name": "DrawAssignment",
        "assignedWork": "9bd39613-c6e2-413f-8672-4b85d7f85ce2",
        "instructions": "Draw a penguin",
        "lateTurnIn": false,
        "dueDate": "1663617458035",
        "options": {
            "sync": true,
            "stats": true
        },
        "classrooms": [
            "630b469b43225439163b8d42",
            "630b46aa43225439163b8d43"
        ],
        "created_time": 1663617458028,
        "timestamp": 1663617458028,
        "created_by": "630b467143225439163b8d40",
        "journal_id": "630b467143225439163b8d3f",
        "isAssigned": false,
        "_id": "6328c9b2831c11556edd785e"
    }   
 * 
 **/
exports.addAssignment = function (req, res) {
	//validate
	if (!req.body.assignment) {
		return res.status(400).send({
			'error': "Assignment object is not defined",
			'code': 38
		});
	}
	//parse assignment details
	var assignment = JSON.parse(req.body.assignment);
	//add timestamps
	assignment.created_time = +new Date();
	assignment.timestamp = +new Date();
	assignment.created_by = req.user._id;
	assignment.journal_id = req.user.private_journal;
	assignment.isAssigned = false;

	//add assignment to database with unique name
	db.collection(assignmentCollection, function (err, collection) {
		if (err) {
			return res.status(500).send({
				'error': "An error has occurred",
				'code': 10
			});
		}
		collection.insertOne(assignment, { safe: true }, function (err, result) {
			if (err) {
				return res.status(500).send({
					'error': "An error has occurred",
					'code': 10
				});
			}
			return res.status(200).send(result.ops[0]);
		});
	});
};

/**
 *@api {get} api/v1/assignments Get all assignments
 * @apiName GetAssignments
 * @apiDescription Retrieve all assignment data registered on the server.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * 
 * @apiParam {String} [name] Name of the assignment <code>e.g. name=final</code>
 * @apiParam {Boolean} [isAssigned] To get assignment already launched <code>e.g. isAssigned=true</code>
 * @apiParam {Boolean} [terminated] To get terminated assignment <code>e.g. terminated=true</code>
 * @apiParam {String} [created_by] Id of the author of the assignment <code>e.g. created_by=630b463f43225439163b8d3e</code>
 * @apiParam {String} [sort=+timestamp] Order of results <code>e.g. sort=-timestamp or sort=-name</code>
 * @apiParam {String} [offset=0] Offset in results <code>e.g. offset=15</code>
 * @apiParam {String} [limit=10] Limit results <code>e.g. limit=5</code>
 * 
 * @apiExample Example usage:
 *      "/api/v1/assignments"
 *      "/api/v1/assignments?name=final"
 *      "/api/v1/assignments?terminated=true"
 *      "/api/v1/assignments?created_by=630b463f43225439163b8d3e"
 *      "/api/v1/assignments?sort=-name&limit=5&offset=20"
 * 
 * @apiSuccess {Object[]} assignments.
 * 
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *      "assignments": [
 *          {
 *              "_id": "63275d05bcb501f024681518",
 *              "name": "Draw Monkey",
 *              "assignedWork": {
 *                  "metadata": {
 *                      "title": "Paint Assignment",
 *                      "title_set_by_user": "0",
 *                      "activity": "org.olpcfrance.PaintActivity",
 *                      "activity_id": "7abd556d-d43a-4e0b-83ec-40f8bf2f13af",
 *                      "creation_time": 1663272983745,
 *                      "timestamp": 1663273031602,
 *                      "file_size": 0,
 *                      "buddy_name": "t1",
 *                      "buddy_color": {
 *                          "stroke": "#FF8F00",
 *                          "fill": "#00A0FF"
 *                      },
 *                      "textsize": 12211,
 *                      "user_id": "630b463f43225439163b8d3e"
 *                  },
 *                  "text": "63238847d625795abbd4b4b6",
 *                  "objectId": "8d909712-68d5-482d-8878-2a978726f05c"
 *              },
 *              "instructions": "Draw some",
 *              "dueDate": 1663547400000,
 *              "classrooms": [
 *                  "630b469b43225439163b8d42",
 *                  "630b468e43225439163b8d41"
 *              ],
 *              "lateTurnIn": false,
 *              "created_time": 1663524101201,
 *              "timestamp": 1663531297792,
 *              "created_by": "630b463f43225439163b8d3e",
 *              "journal_id": "630b463f43225439163b8d3d",
 *              "isAssigned": true,
 *              "insensitive": "draw monkey"
 *          }
 *      ],
 *      "offset": 0,
 *      "limit": 10,
 *      "total": 5,
 *      "sort": "name(asc)",
 *      "links": {
 *          "prev_page": "/api/v1/assignments?limit=10&offset=10",
 *   	    "next_page": "/api/v1/assignments?limit=10&offset=30"
 *      }
 *  }
 **/
//find All assignments 
exports.findAll = function (req, res) {
	var query = {};

	query = addQuery("name", req.query, query);
	query = addQuery("isAssigned", req.query, query);
	query = addQuery("terminated", req.query, query);
	query = addQuery("created_by", req.query, query);
	db.collection(assignmentCollection, function (err, collection) {
		//count
		collection.countDocuments(query, function (err, count) {
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var options = getOptions(req, count, "-timestamp");
			var conf = [
				{
					"$match": query
				},
				{
					$project: {
						_id: 1,
						name: 1,
						dueDate: 1,
						time: 1,
						assignedWork: 1,
						instructions: 1,
						lateTurnIn: 1,
						created_time: 1,
						classrooms: 1,
						created_by: 1,
						timestamp: 1,
						isAssigned: 1,
						journal_id: 1,
						insensitive: { $toLower: "$name" }
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
				var sortItem = {};
				if (options.sort[0][1] == 'desc') {
					sortItem[options.sort[0][0]] = -1;
				} else {
					sortItem[options.sort[0][0]] = 1;
				}
				conf[2]["$sort"] = sortItem;
			}
			//find
			collection.aggregate(conf, function(err, assignments) {
				if (err) {
					return res.status(500).send({
						'error': "An error has occurred",
						'code': 10
					});
				}
				if (options.skip) {
					assignments.skip(options.skip);
				}
				if (options.limit) {
					assignments.limit(options.limit);
				}
				assignments.toArray(function (err, items) {
					//find journal entries bt _id and objectId with aggregate
					db.collection(journalCollection, function (err, collection) {
						if (err) {
							return res.status(500).send({
								'error': "An error has occurred",
								'code': 10
							});
						}
						collection.find({
							'_id': {
								$in: items.map(function (item) {
									return item.journal_id;
								})
							}
						}, {
							projection: {
								'content.objectId': 1,
								'content.metadata': 1,
								'content.text': 1,
							}
						}).toArray(function (err, journals) {
							if (err) {
								return res.status(500).send({
									'error': "An error has occurred",
									'code': 10
								});
							}
							var data = {
								'assignments': items,
								'offset': options.skip,
								'limit': options.limit,
								'total': options.total,
								'sort': options.sort[0][0] + "(" + options.sort[0][1] + ")",
								'links': {
									prev_page: (options.skip - options.limit >= 0) ? formPaginatedUrl(route, params, options.skip - options.limit, options.limit) : undefined,
									next_page: (options.skip + options.limit < options.total) ? formPaginatedUrl(route, params, options.skip + options.limit, options.limit) : undefined
								}
							};
							data.assignments.map(function (item) {
								journals.find(function (journal) {
									journal.content.filter(function (entry) {
										if (entry.objectId === item.assignedWork) {
											item.assignedWork = entry;
										}
									});
								});
							});
							return res.status(200).send(data);
						});
					});
				});
			});
		});
	});
};

/**
 * @api {get} api/v1/assignments/:id Get Deliveries
 * @apiName GetDeliveries
 * @apiGroup Assignments
 * @apiVersion 1.5.0 
 * @apiDescription Get all deliveries for a specific assignment.
 * @apiParam {String} id Assignment id.
 * @apiParam {String} [buddy_name] Buddy name to filter <code>e.g. buddy_name=Nikhil</code>
 * @apiParam {Boolean} [Delivered] To get only assignments already delivered <code>e.g. Delivered=true</code>
 *
 * @apiExample Example usage:
 *      "/api/v1/assignments/630b460e43225439163b8d3b"
 *      "/api/v1/assignments/630b460e43225439163b8d3b?buddy_name=Nikhil"
 *      "/api/v1/assignments/630b460e43225439163b8d3b?Delivered=true"
 *  
 * @apiSuccess {Object[]} deliveries List of deliveries.
 * @apiSuccess {String} _id Journal id.
 * @apiSuccess {Array} content Journal Entry.
 * @apiSuccess {Object} content.metadata Journal Entry metadata.
 * @apiSuccess {String} content.text Journal Entry text.
 * @apiSuccess {String} content.objectId Journal Entry objectId.
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *       "deliveries": [
 *           {
 *               "_id": "630b460e43225439163b8d3b",
 *               "content": [
 *                   {
 *                       "metadata": {
 *                           "title": "Implode Activity",
 *                           "title_set_by_user": "0",
 *                           "activity": "org.sugarlabs.Implode",
 *                           "activity_id": "5cf070b7-8ba0-4e71-a670-ed9df4a4dfc5",
 *                           "creation_time": 1663274452551,
 *                           "timestamp": 1663584032296,
 *                           "file_size": 0,
 *                           "buddy_name": "Nikhil",
 *                           "buddy_color": {
 *                               "stroke": "#F8E800",
 *                               "fill": "#008009"
 *                           },
 *                           "textsize": 2352,
 *                           "user_id": "630b460e43225439163b8d3c",
 *                           "assignmentId": "63275962bcb501f02468148f",
 *                           "submissionDate": 1663584032294,
 *                           "dueDate": 1663605000000,
 *                           "instructions": "dffdfdf",
 *                           "lateTurnIn": true,
 *                           "isSubmitted": true,
 *                           "status": null,
 *                           "comment": ""
 *                       },
 *                       "text": "632848d1781c3ddaa0eb6b9d",
 *                       "objectId": "2b20826f-90c0-4810-83b0-de31cd35b5fe"
 *                   }
 *               ]
 *           },
 *           {
 *               "_id": "630b45f443225439163b8d39",
 *               "content": [
 *                   {
 *                       "metadata": {
 *                           "title": "Implode Activity",
 *                           "title_set_by_user": "0",
 *                           "activity": "org.sugarlabs.Implode",
 *                           "activity_id": "5cf070b7-8ba0-4e71-a670-ed9df4a4dfc5",
 *                           "creation_time": 1663274452551,
 *                           "timestamp": 1663576160640,
 *                           "file_size": 0,
 *                           "buddy_name": "Rohan",
 *                           "buddy_color": {
 *                               "stroke": "#8BFF7A",
 *                               "fill": "#AC32FF"
 *                           },
 *                           "textsize": 2352,
 *                           "user_id": "630b45f443225439163b8d3a",
 *                           "assignmentId": "63275962bcb501f02468148f",
 *                           "submissionDate": 1663576267006,
 *                           "dueDate": 1663605000000,
 *                           "instructions": "dffdfdf",
 *                           "lateTurnIn": true,
 *                           "isSubmitted": true,
 *                           "status": "Delivered",
 *                           "comment": ""
 *                       },
 *                       "text": "63282866781c3ddaa0eb6b1c",
 *                       "objectId": "c90cfadf-83ce-4fba-904a-95ea6c33e3ac"
 *                   }
 *               ]
 *           }
 *       ],
 *       "offset": 0,
 *       "limit": 10,
 *       "total": 7,
 *       "sort": "buddy_name(asc)",
 *       "links": {}
 *      }
**/
//find all deliveries
exports.findAllDeliveries = function (req, res) {
	var assignmentId = req.params.assignmentId;
	//validate
	if (!mongo.ObjectID.isValid(assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	//find all deliveries with filters and pagination
	var query = {"metadata.assignmentId": assignmentId};
	query = addQuery("buddy_name", req.query, query);
	query = addQuery("Delivered", req.query, query);
	db.collection(journalCollection, function (err, collection) {
		//count
		collection.countDocuments(query, function (err, count) {
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var options = getOptions(req, count, "+buddy_name");
			//find all entries which matches with assignment id using aggregation
			collection.aggregate([
				{
					$match: {content: {$elemMatch: query}},
				},
				{
					$project: {
						_id: 1,
						content: {
							$filter: {
								input: "$content",
								as: "item",
								cond: { $eq: ["$$item.metadata.assignmentId", assignmentId] },
							}
						}
					}
				},
				{
					$sort: {
						"content.metadata.buddy_name": 1
					}
				}
			], function(err, deliveries) {
				if (err) {
					return res.status(500).send({
						'error': "An error has occurred",
						'code': 10
					});
				}
				deliveries.get(function(err, all){
					var length = all.length;
					if (options.skip) {
						deliveries.skip(options.skip);
					}
					if (options.limit) {
						deliveries.limit(options.limit);
					}
					deliveries.toArray(function (err, items) {
						options.total = length;
						var data = {
							'deliveries': items,
							'offset': options.skip,
							'limit': options.limit,
							'total': options.total,
							'sort': options.sort[0][0] + "(" + options.sort[0][1] + ")",
							'links': {
								prev_page: (options.skip - options.limit >= 0) ? formPaginatedUrl(route, params, options.skip - options.limit, options.limit) : undefined,
								next_page: (options.skip + options.limit < options.total) ? formPaginatedUrl(route, params, options.skip + options.limit, options.limit) : undefined
							}
						};
						return res.status(200).send(data);
					});
				});
			});
		});
	});
};

/**
 * @api {get} api/v1/assignment/:assignmentId Get assignment details
 * @apiName GetAssignment
 * @apiDescription Retrieve detail for a specific assignment.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * 
 * @apiParam {String} assignmentId Unique id of Assignment to be delete.
 * 
 * @apiSuccess {String} _id Unique assignment id.
 * @apiSuccess {String} name Assignment name.
 * @apiSuccess {Number} dueDate Assignment due date.
 * @apiSuccess {Object} assignedWork Assignment assigned work.
 * @apiSuccess {String} instructions Assignment instructions.
 * @apiSuccess {Boolean} lateTurnIn Assignment late turn in.
 * @apiSuccess {Number} created_time Assignment created time.
 * @apiSuccess {Array} classrooms Assignment assigned to classrooms.
 * @apiSuccess {Object} options Assignment options.
 * @apiSuccess {String} created_by Assignment created by.
 * @apiSuccess {Number} timestamp Assignment timestamp.
 * @apiSuccess {Boolean} isAssigned Assignment is assigned.
 * @apiSuccess {String} journal_id Assignment journal id.
 * 
 * @apiExample Example usage:
 *      "/api/v1/assignment/:assignmentId"
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *      "_id": "63275d05bcb501f024681518",
 *      "name": "Draw Monkey",
 *      "assignedWork": {
 *          "metadata": {
 *              "title": "Paint Assignment",
 *              "title_set_by_user": "0",
 *              "activity": "org.olpcfrance.PaintActivity",
 *              "activity_id": "7abd556d-d43a-4e0b-83ec-40f8bf2f13af",
 *              "creation_time": 1663272983745,
 *              "timestamp": 1663273031602,
 *              "file_size": 0,
 *              "buddy_name": "t1",
 *              "buddy_color": {
 *                  "stroke": "#FF8F00",
 *                  "fill": "#00A0FF"
 *                  },
 *              "textsize": 12211,
 *              "user_id": "630b463f43225439163b8d3e"
 *          },
 *          "text": "63238847d625795abbd4b4b6",
 *          "objectId": "8d909712-68d5-482d-8878-2a978726f05c"
 *     },
 *    "instructions": "Draw some",
 *    "dueDate": 1663547400000,
 *   "classrooms": [
 *      {
 *          "_id": "630b469b43225439163b8d42",
 *          "name": "JS",
 *          "students": [
 *              "630b45f443225439163b8d3a",
 *              "631153f4f2a064f218544c79"
 *          ],
 *          "color": {
 *              "stroke": "#D1A3FF",
 *              "fill": "#F8E800"
 *          },
 *          "options": {
 *              "sync": true,
 *              "stats": true
 *          },
 *          "created_time": 1661683355253,
 *          "timestamp": 1662323105024
 *      },
 *      {
 *          "_id": "630b468e43225439163b8d41",
 *          "name": "Physics",
 *          "students": [
 *              "630b460e43225439163b8d3c",
 *              "630b45f443225439163b8d3a"
 *          ],
 *          "color": {
 *              "stroke": "#FF2B34",
 *              "fill": "#AC32FF"
 *          },
 *          "options": {
 *              "sync": true,
 *              "stats": true
 *          },
 *          "created_time": 1661683342983,
 *          "timestamp": 1661683342983
 *      }
 *   ],
 *   "lateTurnIn": false,
 *   "options": {
 *      "sync": true,
 *      "stats": true
 *      },
 *   "created_time": 1663524101201,
 *   "timestamp": 1663531297792,
 *   "created_by": "630b463f43225439163b8d3e",
 *   "journal_id": "630b463f43225439163b8d3d",
 *   "isAssigned": true
 *  }
 **/
exports.findById = function (req, res) {
	var assignmentId = req.params.assignmentId;
	//validate
	if (!mongo.ObjectID.isValid(assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	db.collection(assignmentCollection, function (err, collection) {
		collection.findOne({ _id: new mongo.ObjectID(assignmentId) }, function (err, assignment) {
			if (err) {
				return res.status(500).send({
					'error': "An error has occurred",
					'code': 10
				});
			}
			if (!assignment) {
				return res.status(401).send({
					'error': "Assignment not found",
					'code': 39
				});
			}
			//find classrooms
			db.collection(classroomCollection, function (err, collection) {
				if (err) {
					return res.status(500).send({
						'error': "An error has occurred",
						'code': 10
					});
				}
				collection.find(
					{
						_id: {
							$in: assignment.classrooms.map(function (classroom) {
								return new mongo.ObjectID(classroom);
							})
						}
					}
				).toArray(function (err, classrooms) {
					if (err) {
						return res.status(500).send({
							'error': "An error has occurred",
							'code': 10
						});
					}
					assignment.classrooms.map(function (class_id) {
						classrooms.map(function (classroom) {
							if (classroom._id.toString() == class_id) {
								assignment.classrooms.splice(assignment.classrooms.indexOf(class_id), 1, classroom);
							}
						});
					});
					db.collection(journalCollection, function (err, collection) {
						if (err) {
							return res.status(500).send({
								'error': "An error has occurred",
								'code': 10
							});
						}
						collection.find(
							{
								_id: new mongo.ObjectID(assignment.journal_id)
							},
							{
								$project: {
									'content.objectId': 1,
									'content.metadata': 1,
									'content.text': 1,
								}
							}
						).toArray(function (err, journals) {
							if (err) {
								return res.status(500).send({
									'error': "An error has occurred",
									'code': 10
								});
							}
							journals.find(function (journal) {
								journal.content.filter(function (entry) {
									if (entry.objectId === assignment.assignedWork) {
										assignment.assignedWork = entry;
									}
								});
							});
							return res.status(200).send(assignment);
						});
					});
				});
			});
		});
	});
};

/** 
 * @api {get} api/v1/assignments/launch/:assignmentId Launch an assignment
 * @apiName LaunchAssignment
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiDescription Launches the assignment for the Students.
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} assignmentId Assignment unique id.
 * 
 * @apiSuccess {Object} count Number of students to whom the assignment has been assigned.
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *     "count": 3
 *   }
 * 
 **/
//launch Assignment
exports.launchAssignment = function (req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	//find assignment by id
	db.collection(assignmentCollection, function (err, collection) {
		collection.findOne({ _id: new mongo.ObjectID(req.params.assignmentId) }, function (err, assignment) {
			if (err) {
				return res.status(400).send({
					'error': 'Inexisting assignment id',
					'code': 40
				});
			}
			if (!assignment) {
				return res.status(401).send({
					'error': "Assignment not found",
					'code': 39
				});
			}
			else {
				if (assignment.dueDate < Date.now()) {
					return res.status(400).send({
						'error': 'Due date already expired',
						'code': 41
					});
				}
				//find all students from classrooms
				var classrooms = assignment.classrooms;
				var launchDate = new Date().getTime();
				//get students private_journal
				common.fetchAllStudents(classrooms).then(function (stds) {
					if (stds.length <= 0) {
						return res.status(400).send({
							'error': 'No students found',
							'code': 37
						});
					}
					//getting unique values of _id and name
					var arr = [];
					var uniqueStudents = [];
					for (var i = 0; i < stds.length; i++) {
						arr.push({ _id: stds[i]._id, name: stds[i].name, journal: stds[i].private_journal.toString() });
					}
					var uniqueStudentsSet = new Set();
					arr.forEach(obj => (
						!uniqueStudentsSet.has(obj) && uniqueStudentsSet.add(JSON.stringify(obj))
					));
					uniqueStudentsSet = new Set([...uniqueStudentsSet].map(o => JSON.parse(o)));
					//convert set to array
					uniqueStudents = Array.from(uniqueStudentsSet);
					db.collection(journalCollection, function (err, collection) {
						if (err) {
							return res.status(500).send({
								'error': "An error has occurred",
								'code': 10
							});
						} else {
							collection.aggregate([
								{
									$match: {
										'_id': new mongo.ObjectID(req.user.private_journal),
										"content.objectId": assignment.assignedWork
									}
								},
								{
									$project: {
										_id: 0,
										content: {
											$filter: {
												input: "$content",
												as: "item",
												cond: { $eq: ["$$item.objectId", assignment.assignedWork] }
											}
										}
									}
								},
							]).toArray(function (err, entry) {
								if (err) {
									return res.status(500).send({
										'error': "An error has occurred",
										'code': 10
									});
								} else {
									// adding assignment metadata to entry
									if (entry.length > 0) {
										entry[0].content[0].metadata.assignmentId = req.params.assignmentId;
										entry[0].content[0].metadata.submissionDate = null;
										entry[0].content[0].metadata.dueDate = assignment.dueDate;
										entry[0].content[0].metadata.instructions = assignment.instructions;
										entry[0].content[0].metadata.lateTurnIn = assignment.lateTurnIn;
										entry[0].content[0].metadata.isSubmitted = false;
										entry[0].content[0].metadata.status = null;
										entry[0].content[0].metadata.comment = "";
										entry[0].content[0].metadata.timestamp = launchDate;
									} else {
										return res.status(404).send({
											'error': "Entry not found",
											'code': 36
										});
									}
									updateEntries(entry[0].content[0], uniqueStudents).then(function (result) {
										var content = result.content;
										var count = result.count;
										updateStatus(req.params.assignmentId, "Assigned", content.objectId, function (err, result) {
											if (err) {
												return res.status(500).send({
													'error': "An error has occurred",
													'code': 10
												});
											} else {
												return res.status(200).send(result);
											}
										});
										return res.status(200).send({
											count: count
										});
									}).catch(function () {
										return res.status(500).send({
											'error': "An error has occurred",
											'code': 10
										});
									});
								}
							});
						}
					});
				}).catch(function () {
					return res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				});
			}
		});
	});
};

//private function to update entries
function updateEntries(entryDoc, uniqueStudents) {
	return new Promise(function (resolve, reject) {
		if (mongo.ObjectID.isValid(entryDoc.text)) {
			db.collection(CHUNKS_COLL, function (err, collection) {
				collection.find({
					files_id: new mongo.ObjectID(entryDoc.text)
				}).toArray(function (err, chunks) {
					if (err) {
						reject(err);
					}
					else {
						for (var counter = 0, i = 0; i < uniqueStudents.length; i++) {
							// add objectid
							journal.copyEntry(entryDoc, chunks, uniqueStudents[i]).then(function (result) {
								var copy = result.copy;
								var student = result.student;
								db.collection(journalCollection, function (err, collection) {
									if (err) {
										reject(err);
									} else {
										collection.updateOne(
											{
												_id: new mongo.ObjectID(student.journal)
											},
											{
												$push:
												{
													content: copy
												}
											}, function (err) {
												counter++;
												if (err) {
													reject(err);
												} else {
													if (counter == uniqueStudents.length) return resolve({content: entryDoc, count: counter});
												}
											});
									}
								});
							}).catch(function (err) {
								reject(err);
							});
						}
					}
				});
			});
		}
	});
}

/**
 *@api {delete} api/assignments/:assignmentId Remove assignment
 * @apiName RemoveAssignment
 * @apiDescription Remove assignment by assignmentId.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} assignmentId Unique id of Assignment to be delete.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *  {
        "id": "6328c9b2831c11556edd785e"
    }
 **/
exports.removeAssignment = function (req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	db.collection(assignmentCollection, function (err, collection) {
		collection.deleteOne(
			{
				_id: new mongo.ObjectID(req.params.assignmentId)
			},
			function (err, result) {
				if (err) {
					return res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						return res.status(200).send({
							id: req.params.assignmentId
						});
					} else {
						return res.status(401).send({
							error: "Inexisting assignment id",
							code: 40
						});
					}
				}
			});
	});
};

//api doc for update Assignment
/**
 * @api {put} api/assignments/:assignmentId Update assignment
 * @apiName UpdateAssignment
 * @apiDescription Update an assignment. Return the assignment updated.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * 
 * @apiParam {String} assignmentId Assignment unique id.
 * 
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *  {
 *     "id": "6328c9b2831c11556edd785e",
 *  }
 * */
// update assignment
exports.updateAssignment = function (req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	var assignmentId = req.params.assignmentId;
	var assignment = JSON.parse(req.body.assignment);
	//add timestamp
	assignment.timestamp = +new Date();
	//find assignment by id
	db.collection(assignmentCollection, function (err, collection) {
		collection.updateOne(
			{
				_id: new mongo.ObjectID(req.params.assignmentId)
			},
			{
				$set: assignment
			},
			{
				safe: true,
			},
			function (err, result) {
				if (err) {
					return res.status(500).send({
						'error': "An error has occurred",
						'code': 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						return res.send({
							id: assignmentId
						});
					} else {
						return res.status(401).send({
							'error': "Inexisting assignment id",
							'code': 40
						});
					}
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


function addQuery(filter, params, query, default_val) {
	//check default case
	query = query || {};
	//validate
	if (
		typeof params[filter] != "undefined" &&
        typeof params[filter] === "string"
	) {
		if (filter == "name") {
			query["name"] = {
				$regex: new RegExp(params[filter], "i")
			};
		} else if (filter == "buddy_Name") {
			query["buddy_name"] = {
				$regex: new RegExp(params[filter], "i")
			};
		} else if (filter == "isAssigned") {
			if (params[filter] == "true") {
				query["isAssigned"] = {
					$eq: true
				};
				//also checking dueDate is greater than current date.
				query["dueDate"] = {
					$gte: new Date().getTime()
				};
			}
			if (params[filter] == "false") {
				query["isAssigned"] = {
					$eq: false
				};
			}
		} else if (filter == "terminated") {
			query["dueDate"] = {
				$lte: new Date().getTime()
			};
		} else if (filter == "Delivered") {
			if (params[filter] == "true") {
				query["metadata.isSubmitted"] = {
					$eq: true
				};
			} else if (params[filter] == "false") {
				query["metadata.isSubmitted"] = {
					$eq: false
				};
			}
		} else if (filter == "created_by") {
			query["created_by"] = {
				$eq: new mongo.ObjectID(params[filter])
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
 * @api {put} api/assignments/:assignmentId/comments/:commentId Update comment
 * @apiName UpdateComment
 * @apiDescription Update a comment. Return the comment updated.
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * 
 * @apiParam {String} assignmentId Assignment unique id.
 * @apiParam {String} commentId Comment unique id.
 * 
 * @apiSuccess {String} comment Comment.
 * 
 * @apiExample Example usage:
 *    "/api/v1/assignments/deliveries/comment/:assignmentId?oid=5b9b1b0b0f0000b800000000"
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *      "comment": "Good"
 *   }
 **/
//update comment 
exports.updateComment = function (req, res) {
	//validate
	if (!req.query.oid || !mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	var assignmentId = req.params.assignmentId;
	var comment = JSON.parse(req.body.comment);
	var objectId = req.query.oid;
	db.collection(journalCollection, function (err, collection) {
		collection.findOneAndUpdate(
			{
				'content.objectId': objectId,
				'content.metadata.assignmentId': assignmentId,
			},
			{  //set comment only if it is match with objectId
				$set: {
					'content.$[elem].metadata.comment': comment.comment,
				}
			},
			{
				safe: true,
				arrayFilters: [{
					'elem.objectId': objectId

				}]
			},
			function (err) {
				if (err) {
					return res.status(401).send({
						'error': "An error has occurred",
						'code': 10
					});
				} else {
					return res.status(200).send({
						comment: comment.comment
					});
				}
			});
	});
};

//update status
function updateStatus(assignmentId, status, objectId, callback) {
	//validate
	if (!mongo.ObjectID.isValid(assignmentId)) {
		callback();
	}
	if (status == "Assigned") {
		db.collection(assignmentCollection, function (err, collection) {
			collection.findOneAndUpdate(
				{
					'_id': new mongo.ObjectID(assignmentId)
				},
				{
					$set: {
						'isAssigned': true,
					}
				},
				{
					safe: true,
				},
				function (err, result) {
					if (err) {
						callback(err);
					} else {
						callback(result);
					}
				});
		});
	}
	if (status == "Delivered") {
		db.collection(journalCollection, function (err, collection) {
			collection.findOneAndUpdate(
				{
					'content.objectId': objectId,
					'content.metadata.assignmentId': assignmentId,
				},
				{
					$set: {
						'content.$[elem].metadata.status': status
					}
				},
				{
					safe: true,
					arrayFilters: [{
						'elem.objectId': objectId
					}]
				},
				function (err, result) {
					if (err) {
						callback(err);
					} else {
						callback(result);
					}
				});
		});
	}
}

/** 
 * @api {PUT} api/v1/assignments/deliveries/return/:assignmentId Return Assignment 
 * @apiName ReturnAssignment
 * @apiDescription Return Assignment 
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} assignmentId Assignment id.
 * 
 * @apiExample Example usage:
 *    "/api/v1/assignments/deliveries/return/:assignmentId?oid=5b9b1b0b0f0000b800000000"
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *   "lastErrorObject": {
 *       "n": 1,
 *       "updatedExisting": true
 *   },
 *   "value": {
 *       "_id": "630b460e43225439163b8d3b",
 *       "content": [
 *           {
 *               "metadata": {
 *                   "title": "Write Activity",
 *                   "title_set_by_user": "0",
 *                   "activity": "org.sugarlabs.Write",
 *                   "activity_id": "06dd648a-9f6a-4251-8f15-0abd6bcc3017",
 *                   "creation_time": 1663274425907,
 *                   "timestamp": 1663576199678,
 *                   "file_size": 0,
 *                   "buddy_name": "Nikhil",
 *                   "buddy_color": {
 *                       "stroke": "#F8E800",
 *                       "fill": "#008009"
 *                   },
 *                   "textsize": 100553,
 *                   "user_id": "630b460e43225439163b8d3c",
 *                   "assignmentId": "6327099f730d98993ee793ff",
 *                   "submissionDate": 1663576204212,
 *                   "dueDate": 1663781400000,
 *                   "instructions": "Write about Elon musk",
 *                   "lateTurnIn": false,
 *                   "isSubmitted": false,
 *                   "status": "Delivered",
 *                   "comment": "Nice work"
 *               },
 *               "text": "63282889781c3ddaa0eb6b25",
 *               "objectId": "fc801777-fdb1-4ce2-8f62-561cccc0c38b"
 *           },
 *           ....more objects
 *           {
 *               "metadata": {
 *                   "title": "Write Activity",
 *                   "title_set_by_user": "0",
 *                   "activity": "org.sugarlabs.Write",
 *                   "activity_id": "06dd648a-9f6a-4251-8f15-0abd6bcc3017",
 *                   "creation_time": 1663274425907,
 *                   "timestamp": 1663274434078,
 *                   "file_size": 0,
 *                   "buddy_name": "Nikhil",
 *                   "buddy_color": {
 *                       "stroke": "#00EA11",
 *                       "fill": "#005FE4"
 *                   },
 *                   "textsize": 100524,
 *                   "user_id": "630b460e43225439163b8d3c",
 *                   "assignmentId": "63275d05bcb501f024681518",
 *                   "submissionDate": null,
 *                   "dueDate": "",
 *                   "instructions": "ins",
 *                   "lateTurnIn": false,
 *                   "isSubmitted": false,
 *                   "status": null,
 *                   "comment": "paint"
 *               },
 *               "text": "632c0475ad098c1a779b05b8",
 *               "objectId": "98406ca6-861d-4e98-836d-eb819ab60e3c"
 *           }
 *       ],
 *       "shared": false
 *   },
 *   "ok": 1
 *   }
 * 
 **/
exports.returnAssignment = function (req, res) {
	//validate
	if (!req.query.oid || !mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	var assignmentId = req.params.assignmentId;
	var objectId = req.query.oid;
	db.collection(journalCollection, function (err, collection) {
		collection.findOneAndUpdate(
			{
				'content.objectId': objectId,
				'content.metadata.assignmentId': assignmentId,
			},
			{
				$set: {
					'content.$[elem].metadata.isSubmitted': false
				}
			},
			{
				safe: true,
				arrayFilters: [{
					'elem.objectId': objectId
				}]
			},
			function (err, result) {
				if (err) {
					return res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					return res.send(result);
				}
			});
	});
};

/** 
 * @api {PUT} api/v1/assignments/deliveries/submit/:assignmentId Submit Assignment
 * @apiName SubmitAssignment
 * @apiDescription Submit Assignment. 
 * @apiGroup Assignments
 * @apiVersion 1.5.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} assignmentId Assignment id.
 * 
 * @apiExample Example usage:
 *    "/api/v1/assignments/deliveries/submit/:assignmentId?oid=5b9b1b0b0f0000b800000000"
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *   {
 *   "lastErrorObject": {
 *       "n": 1,
 *       "updatedExisting": true
 *   },
 *   "value": {
 *       "_id": "630b460e43225439163b8d3b",
 *       "content": [
 *           {
 *               "metadata": {
 *                   "title": "Write Activity",
 *                   "title_set_by_user": "0",
 *                   "activity": "org.sugarlabs.Write",
 *                   "activity_id": "06dd648a-9f6a-4251-8f15-0abd6bcc3017",
 *                   "creation_time": 1663274425907,
 *                   "timestamp": 1663576199678,
 *                   "file_size": 0,
 *                   "buddy_name": "Nikhil",
 *                   "buddy_color": {
 *                       "stroke": "#F8E800",
 *                       "fill": "#008009"
 *                   },
 *                   "textsize": 100553,
 *                   "user_id": "630b460e43225439163b8d3c",
 *                   "assignmentId": "6327099f730d98993ee793ff",
 *                   "submissionDate": 1663576204212,
 *                   "dueDate": 1663781400000,
 *                   "instructions": "Write about Elon musk",
 *                   "lateTurnIn": false,
 *                   "isSubmitted": false,
 *                   "status": "Delivered",
 *                   "comment": "Nice work"
 *               },
 *               "text": "63282889781c3ddaa0eb6b25",
 *               "objectId": "fc801777-fdb1-4ce2-8f62-561cccc0c38b"
 *           },
 *           ....more objects
 *           {
 *               "metadata": {
 *                   "title": "Write Activity",
 *                   "title_set_by_user": "0",
 *                   "activity": "org.sugarlabs.Write",
 *                   "activity_id": "06dd648a-9f6a-4251-8f15-0abd6bcc3017",
 *                   "creation_time": 1663274425907,
 *                   "timestamp": 1663274434078,
 *                   "file_size": 0,
 *                   "buddy_name": "Nikhil",
 *                   "buddy_color": {
 *                       "stroke": "#00EA11",
 *                       "fill": "#005FE4"
 *                   },
 *                   "textsize": 100524,
 *                   "user_id": "630b460e43225439163b8d3c",
 *                   "assignmentId": "63275d05bcb501f024681518",
 *                   "submissionDate": null,
 *                   "dueDate": "1663741400000",
 *                   "instructions": "ins",
 *                   "lateTurnIn": false,
 *                   "isSubmitted": true,
 *                   "status": "Delivered",
 *                   "comment": "paint"
 *               },
 *               "text": "632c0475ad098c1a779b05b8",
 *               "objectId": "98406ca6-861d-4e98-836d-eb819ab60e3c"
 *           }
 *       ],
 *       "shared": false
 *   },
 *   "ok": 1
 *   }
 * 
 **/
// submit assignment 
exports.submitAssignment = function (req, res) {
	//validate
	if (!req.query.oid || !mongo.ObjectID.isValid(req.params.assignmentId)) {
		return res.status(401).send({
			'error': "Invalid assignment id",
			'code': 35
		});
	}
	var assignmentId = req.params.assignmentId;
	var objectId = req.query.oid;
	updateStatus(assignmentId, "Delivered", objectId, function (result) {
		if (result) {
			return res.status(200).send(result);
		}
		else {
			return res.status(500).send({
				error: "An error has occurred",
				code: 10
			});
		}
	});
	db.collection(journalCollection, function (err, collection) {
		//date in unix timestamp format
		var date = new Date().getTime();

		collection.findOneAndUpdate(
			{
				'content.objectId': objectId,
				'content.metadata.assignmentId': assignmentId,
			},
			{
				$set: {
					'content.$[elem].metadata.submissionDate': date,
					'content.$[elem].metadata.isSubmitted': true

				}
			},
			{
				safe: true,
				arrayFilters: [{
					'elem.objectId': objectId
				}]
			},
			function (err, result) {
				if (err) {
					return res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					return res.send(result);
				}
			});
	});
};

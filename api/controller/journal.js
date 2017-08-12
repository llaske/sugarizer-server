// Journal handling

var mongo = require('mongodb'),
	users = require('./users');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server;
var db;

var journalCollection;

var shared = null;

//- Utility functions

// Init database
exports.init = function(settings, callback) {
	journalCollection = settings.collections.journal;
	server = new Server(settings.database.server, settings.database.port, {
		auto_reconnect: true
	});
	db = new Db(settings.database.name, server, {
		w: 1
	});

	// Open the journal collection
	db.open(function(err, db) {
		if (!err) {
			db.collection(journalCollection, function(err, collection) {
				// Get the shared journal collection
				collection.findOne({
					'shared': true
				}, function(err, item) {
					// Not found, create one
					if (!err && item == null) {
						collection.insert({
							content: [],
							shared: true
						}, {
							safe: true
						}, function(err, result) {
							shared = result[0];
						});
					}

					// Already exist, save it
					else if (item != null) {
						shared = item;
					}

					if (callback) callback();
				});
			});
		}
	});
}

// Get shared journal
exports.getShared = function() {
	return shared;
}

// Create a new journal
exports.createJournal = function(callback) {
	db.collection(journalCollection, function(err, collection) {
		collection.insert({
			content: [],
			shared: false
		}, {
			safe: true
		}, callback)
	});
}

/**
 * @api {get} api/v1/journal Get all journals
 * @apiName GetAllJournals
 * @apiDescription It will get all the journals present in the database. Private and shared can be filtered using the "type" query param. Admin can access all journals but student can access only shared and his/her private journal.
 * @apiGroup Journal
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/journal"
 *     "/api/v1/journal?type=shared"
 *     "/api/v1/journal?type=private"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} [type] Type of the journal (shared or private)
 *
 * @apiSuccess {String} _id Unique id of the journal
 * @apiSuccess {Boolean} type Type of the journal
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *       "_id": "5946d4fc9f0e36686c50a548",
 *       "shared": true
 *      },
 *      {
 *       "_id": "5954089e088a9fd957734e46",
 *       "shared": false
 *      }
 *     ]
 **/
exports.findAll = function(req, res) {

	//set options
	var options = {};
	if (req.query.type) {
		options.shared = (req.query.type == 'shared' ? true : false);
	}

	// add role based validation
	if (req.user.role == 'student') {
		options._id = {
			$in: [
				new BSON.ObjectID(req.user.private_journal),
				new BSON.ObjectID(req.user.shared_journal)
			]
		}
	}

	//get data
	db.collection(journalCollection, function(err, collection) {
		collection.find(options).toArray(function(err, items) {

			//count
			for (var i = 0; i < items.length; i++) {
				items[i].count = items[i].content.length;
				delete items[i].content;
			}

			//return
			res.send(items);
		});
	});
}

//- REST interface

// Add a new journal
exports.addJournal = function(req, res) {
	exports.createJournal(function(err, result) {
		if (err) {
			res.status(500).send({
				'error': 'An error has occurred'
			});
		} else {
			res.send(result[0]);
		}
	});
}

/**
 * @api {get} api/v1/journal/:jid Get journal entries
 * @apiName GetJournalContent
 * @apiDescription Retrieve full content of a journal. Result include both metadata and text. Admin has access to all journals but student can access entries of his/her journal only.
 *
 * @apiGroup Journal
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96"
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown"
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&uid=5569f4b019e0b4c9525b3c97"
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp"
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp&offset=15&limit=10"
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&sort=-timestamp&fields=text,metadata"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 * @apiParam {String} [aid] filter on activity id <code>e.g. aid=org.sugarlabs.Markdown</code>
 * @apiParam {Boolean} [oid] filter on object id of the activity <code>e.g. oid=4837240f-bf78-4d22-b936-3db96880f0a0</code>
 * @apiParam {String} [uid] filter on user id <code>e.g. uid=5569f4b019e0b4c9525b3c97</code>
 * @apiParam {String} [fields=metadata] field limiting <code>e.g. fields=text,metadata </code>
 * @apiParam {String} [sort=+timestamp] Order of results <code>e.g. sort=-timestamp or sort=-creation_time</code>
 * @apiParam {String} [offset=0] Offset in results <code>e.g. offset=15</code>
 * @apiParam {String} [limit=10] Limit results <code>e.g. limit=5</code>*
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal.
 * @apiSuccess {Number} offset Offset in journal entries
 * @apiSuccess {Number} limit Limit on number of results
 * @apiSuccess {Number} total total number of results
 * @apiSuccess {Object} link pagination links
 *
 * @apiSuccessExample {Json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "entries" : [
 *       {
 *         "metadata": {
 *           "title": "Read me !",
 *           "title_set_by_user": "0",
 *           "activity": "org.sugarlabs.Markdown",
 *           "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *           "creation_time": ​1423341000747,
 *           "timestamp": ​1423341066909,
 *           "file_size": ​0,
 *           "user_id": "5569f4b019e0b4c9525b3c97",
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0",
 *         "journalId": "596bfc2e16d5147938518284"
 *       },
 *       {
 *         "metadata": {
 *           "title": "Physics JS Activity",
 *           "title_set_by_user": "0",
 *           "activity": "org.olpg-france.physicsjs",
 *           "activity_id": "43708a15-f48e-49b1-85ef-da4c1419b364",
 *           "creation_time": ​1436003632237,
 *           "timestamp": ​1436025389565,
 *           "file_size": ​0,
 *           "user_id": "5569f4b019e0b4c9525b3c97",
 *           "buddy_name": "Lionel",
 *           "buddy_color": {
 *             "stroke": "#00A0FF",
 *             "fill": "#F8E800"
 *           }
 *         },
 *         "objectId": "2acbcd69-aa14-4273-8a9f-47642b41ad9d",
 *         "journalId": "596bfc2e16d5147938518284"
 *       },
 *       ...
 *     ],
 *     "limit": 10,
 *     "offset": 20,
 *     "total": 200,
 *     "links": {
 *     	"prev_page": "/api/v1/journal/5569f4b019e0b4c9525b3c96?limit=10&offset=10",
 *     	"next_page": "/api/v1/journal/5569f4b019e0b4c9525b3c96?limit=10&offset=30"
 *     }
 *    }
 **/
exports.findJournalContent = function(req, res) {

	//validate journal  id
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401).send({
			'error': 'Invalid journal id'
		});
		return;
	}

	// validate on the basis of user's role
	validateUser(req, res);

	//get options
	var options = getOptions(req);

	//get data
	db.collection(journalCollection, function(err, collection) {
		collection.aggregate(options, function(err, items) {

			//check for errors
			if (err) {
				return res.status(500).send({
					'error': err
				});
			}

			//define var
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var skip = parseInt(req.query.offset || 0);
			var limit = parseInt(req.query.limit || 10);
			var total = items.length;

			//apply pagination
			items = items.slice(skip, (skip + limit));

			// Return
			return res.send({
				'entries': items,
				'offset': skip,
				'limit': limit,
				'total': total,
				'links': {
					'prev_page': ((skip - limit) >= 0) ? formPaginatedUrl(route, params, (skip - limit), limit) : undefined,
					'curr_page': formPaginatedUrl(route, params, (skip), limit),
					'next_page': ((skip + limit) < total) ? formPaginatedUrl(route, params, (skip + limit), limit) : undefined,
				}
			});
		});
	});
}

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
	return '?' + str.join("&");
}

//form options
function getOptions(req) {

	//form object with journal id
	var options = [{
		$match: {
			'_id': new BSON.ObjectID(req.params.jid)
		}
	}];

	//unwind data
	options.push({
		$unwind: '$content'
	});

	//add filter based on aid,uid,oid
	if (req.query.aid) {
		options.push({
			$match: {
				'content.metadata.activity': req.query.aid
			}
		});
	}
	if (req.query.uid) {
		options.push({
			$match: {
				'content.metadata.user_id': req.query.uid
			}
		});
	}
	if (req.query.oid) {
		options.push({
			$match: {
				'content.objectId': req.query.oid
			}
		});
	}

	//project data
	if (req.query.fields) {

		//get fields
		var fields = req.query.fields.toLowerCase().split(',');
		var qry = {
			'_id': 0,
			'objectId': '$content.objectId',
			'metadata': '$content.metadata'
		};

		//based on condition
		if (fields.indexOf('text') > -1) qry.text = '$content.text';
		options.push({
			$project: qry
		});
	} else {
		options.push({
			$project: {
				'metadata': '$content.metadata',
				'objectId': '$content.objectId',
				'_id': 0,
				'journalId': {
					$literal: req.params.jid
				}
			}
		});
	}

	//sorting
	var sort_val = (typeof req.query.sort === "string" ? req.query.sort : '+timestamp');
	var sort_type = sort_val.indexOf("-") == 0 ? -1 : 1;
	var sort = {};
	sort['metadata.' + sort_val.substring(1).toLowerCase()] = sort_type;
	options.push({
		$sort: sort
	});

	//return
	return options;
}

/**
 * @api {post} api/v1/Journal/:jid Add entry
 * @apiName AddEntry
 * @apiDescription Add an entry in a journal. Return the entry created. If the entry already exist, update it instead. Admin has access to all journals but student can modify his/her journal only.
 * @apiGroup Journal
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} jid Unique id of the journal where the entry will be created
 *
 * @apiSuccess {String} objectId Unique id of the entry in the journal
 * @apiSuccess {Object} metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} metadata.title Title of the entry
 * @apiSuccess {String} metadata.title_set_by_user 0 is the title has been changed by user, 1 if it's the original one (usually activity name)
 * @apiSuccess {String} metadata.activity Activity unique ID used
 * @apiSuccess {String} metadata.activity_id ID of the activity instance
 * @apiSuccess {Number} metadata.creation_time Timestamp, creation time of the entry
 * @apiSuccess {Number} metadata.timestamp Timestamp, last time the instance was updated
 * @apiSuccess {Number} metadata.file_size Here for Sugar compatibility, always set to 0
 * @apiSuccess {String} metadata.user_id User id of the entry creator
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.stroke Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.fill Buddy fill color of the entry creator
 * @apiSuccess {String} text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "metadata": {
 *         "title": "Read me !",
 *         "title_set_by_user": "0",
 *         "activity": "org.sugarlabs.Markdown",
 *         "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *         "creation_time": ​1423341000747,
 *         "timestamp": ​1423341000747,
 *         "file_size": ​0,
 *         "user_id": "5569f4b019e0b4c9525b3c97",
 *         "buddy_name": "Lionel",
 *         "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         }
 *       },
 *       "text": "\"# Hello World !\\n\"",
 *       "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *    }
 **/
exports.addEntryInJournal = function(req, res) {
	// Get parameter
	if (!BSON.ObjectID.isValid(req.params.jid) || !req.body.journal) {
		res.status(401).send({
			'error': 'Invalid journal id or entry'
		});
		return;
	}
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);

	// validate on the basis of user's role
	validateUser(req, res);

	// Look for existing entry with the same objectId
	var filter = {
		'_id': new BSON.ObjectID(jid),
		'content.objectId': journal.objectId
	};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				// Add a new entry
				var newcontent = {
					$push: {
						content: journal
					}
				};
				db.collection(journalCollection, function(err, collection) {
					collection.update({
						'_id': new BSON.ObjectID(jid)
					}, newcontent, {
						safe: true
					}, function(err, result) {
						if (err) {
							return res.status(500).send({
								'error': 'An error has occurred'
							});
						} else {
							if (result) {
								return res.send(journal);
							} else {
								return res.status(401).send({
									'error': 'An error has occurred'
								});
							}
						}
					});
				});
			} else {
				// Update the entry
				req.params.oid = journal.objectId;
				exports.updateEntryInJournal(req, res);
			}
		});
	});
}

/**
 * @api {put} api/v1/journal/:jid Update entry
 * @apiName UpdateEntry
 * @apiDescription Update an entry in a journal. Return the entry updated. If the entry don't exist, create a new one instead. Admin has access to all journals but student can modify his/her journal only.
 * @apiGroup Journal
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?oid=d3c7cfc2-8a02-4ce8-9306-073814a2024e"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} jid Unique id of the journal to update
 * @apiParam {String} oid Unique id of the entry to update
 *
 * @apiSuccess {String} objectId Unique id of the entry in the journal
 * @apiSuccess {Object} metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} metadata.title Title of the entry
 * @apiSuccess {String} metadata.title_set_by_user 0 is the title has been changed by user, 1 if it's the original one (usually activity name)
 * @apiSuccess {String} metadata.activity Activity unique ID used
 * @apiSuccess {String} metadata.activity_id ID of the activity instance
 * @apiSuccess {Number} metadata.creation_time Timestamp, creation time of the entry
 * @apiSuccess {Number} metadata.timestamp Timestamp, last time the instance was updated
 * @apiSuccess {Number} metadata.file_size Here for Sugar compatibility, always set to 0
 * @apiSuccess {String} metadata.user_id User id of the entry creator
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.stroke Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.fill Buddy fill color of the entry creator
 * @apiSuccess {String} text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "metadata": {
 *         "title": "Read me now !",
 *         "title_set_by_user": "0",
 *         "activity": "org.sugarlabs.Markdown",
 *         "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *         "creation_time": ​1423341000747,
 *         "timestamp": ​1423341066120,
 *         "file_size": ​0,
 *         "user_id": ​"5569f4b019e0b4c9525b3c97",
 *         "buddy_name": "Lionel",
 *         "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *         }
 *       },
 *       "text": "\"# Hello Sugarizer user !\\n\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\n\\n\"",
 *       "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
 *    }
 **/
exports.updateEntryInJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid) || !req.query.oid) {
		res.status(401).send({
			'error': 'Invalid journal or object id'
		});
		return;
	}
	var jid = req.params.jid;
	var oid = req.query.oid;

	// validate on the basis of user's role
	validateUser(req, res);

	// Delete the entry
	var deletecontent = {
		$pull: {
			content: {
				objectId: oid
			}
		}
	};
	db.collection(journalCollection, function(err, collection) {
		collection.update({
			'_id': new BSON.ObjectID(jid)
		}, deletecontent, {
			safe: true
		}, function(err, result) {
			if (err) {
				return res.status(500).send({
					'error': 'An error has occurred'
				});
			} else {
				// Add the updated entry
				exports.addEntryInJournal(req, res);
			}
		});
	});
}

/**
 * @api {delete} api/v1/journal/:jid Remove entry/journal
 * @apiName RemoveEntryJournal
 * @apiDescription Remove an entry in a journal or the complete journal. Return the id of the entry or journal. Admin has access to all journals but student can modify his/her journal only.
 * @apiGroup Journal
 * @apiVersion 1.0.0
 *
 * @apiExample Example usage:
 *     "/api/v1/journal?type=full"
 *     "/api/v1/journal?type=partial&oid=d3c7cfc2-8a02-4ce8-9306-073814a2024e"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} jid Unique id of the journal to delete
 * @apiParam {String} [oid] Unique id of the entry to delete when type is set to partial
 * @apiParam {String} [type=partial] <code>type=full</code> when to delete the entire journal else <code>type=partial</code>
 *
 * @apiSuccess {String} [objectId] Unique id of the entry removed
 * @apiSuccess {String} [jid] Unique id of the journal removed
 *
 * @apiSuccessExample Success-Response-Journal:
 *     HTTP/1.1 200 OK
 *     {
 *      "jid": "5569f4b019e0b4c9525b3c97"
 *     }
 *
 * @apiSuccessExample Success-Response-Entry:
 *     HTTP/1.1 200 OK
 *     {
 *      "objectId": "d3c7cfc2-8a02-4ce8-9306-073814a2024e"
 *     }
 **/
exports.removeInJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401).send({
			'error': 'Invalid journal id'
		});
		return;
	}
	var jid = req.params.jid;
	var oid = (req.query.oid) ? req.query.oid : false;;
	var type = (req.query.type) ? req.query.type : 'partial';

	// validate on the basis of user's role
	validateUser(req, res);

	//whether or partial is deleted!
	if (type == 'full') {
		db.collection(journalCollection, function(err, collection) {
			collection.remove({
				'_id': new BSON.ObjectID(jid)
			}, function(err, result) {
				if (err) {
					return res.status(500).send({
						'error': 'An error has occurred'
					});
				} else {
					if (result) {
						return res.send({
							'jid': jid
						});
					} else {
						return res.status(401).send({
							'error': 'Error while deleting journal!'
						});
					}
				}
			});
		});
	} else {
		if (oid) {
			db.collection(journalCollection, function(err, collection) {
				collection.update({
					'_id': new BSON.ObjectID(jid)
				}, {
					$pull: {
						content: {
							objectId: oid
						}
					}
				}, {
					safe: true
				}, function(err, result) {
					if (err) {
						return res.status(500).send({
							'error': 'An error has occurred'
						});
					} else {
						if (result) {
							return res.send({
								'objectId': oid
							});
						} else {
							return res.status(401).send({
								'error': 'Error while deleting journal entry!'
							});
						}

					}
				});
			});
		} else {
			return res.status(401).send({
				'error': 'Invalid Object ID'
			});
		}
	}
}

//check user permission
var validateUser = function(req, res) {
	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if ([req.user.private_journal.toString(), req.user.shared_journal.toString()].indexOf(req.params.jid) == -1) {
			return res.status(401).send({
				'error': 'You don\'t have permission to remove this journal'
			});
		}
	}
}

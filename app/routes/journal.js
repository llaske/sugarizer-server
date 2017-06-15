// Journal handling

var mongo = require('mongodb');

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

// Remove a journal
exports.removeJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401);
		res.send({
			'error': 'Invalid journal id'
		});
		return;
	}
	var jid = req.params.jid;
	db.collection(journalCollection, function(err, collection) {
		collection.remove({
			'_id': new BSON.ObjectID(jid)
		}, function(err, result) {
			if (err) {
				res.status(401);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				res.send(req.params.jid);
			}
		});
	});
}

// Find all journal
exports.findAll = function(req, res) {
	db.collection(journalCollection, function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
}

//- REST interface

// Add a new journal
exports.addJournal = function(req, res) {
	exports.createJournal(function(err, result) {
		if (err) {
			res.status(401);
			res.send({
				'error': 'An error has occurred'
			});
		} else {
			res.send(result[0]);
		}
	});
}

/**
 * @api {get} /journal/shared Get shared journal
 * @apiName GetSharedJournal
 * @apiDescription Retrieve id of the shared journal on the server. On the server, there is only one journal shared by all users.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiSuccess {String} _id Id of the shared journal on the server
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "536d30874326e55f2a22816f"
 *     }
 **/
exports.findSharedJournal = function(req, res) {
	res.send({
		_id: shared._id
	});
}

/**
 * @api {get} /journal/:jid Get journal entries
 * @apiName GetJournalContent
 * @apiDescription Retrieve full content of a journal. Result include both metadata and text.
 *
 * **Deprecated**: it's better to use the "api/journal/:jid/field/:field" to avoid big entries in the result.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "metadata": {
 *           "title": "Read me !",
 *           "title_set_by_user": "0",
 *           "activity": "org.sugarlabs.Markdown",
 *           "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *           "creation_time": ​1423341000747,
 *           "timestamp": ​1423341066909,
 *           "file_size": ​0,
 *           "buddy_name": "Sugarizer server",
 *           "buddy_color": {
 *             "stroke": "#005FE4",
 *             "fill": "#FF2B34"
 *           }
 *         },
 *         "text": "\"# Hello Sugarizer user !\\n\\nWelcome to the Sugarizer server cloud storage. You could put everything that you need to share.\\n\\n\"",
 *         "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0"
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
 *           "buddy_name": "Lionel",
 *           "buddy_color": {
 *             "stroke": "#00A0FF",
 *             "fill": "#F8E800"
 *           }
 *         },
 *         "text": "{\"world\":[{\"type\":\"circle\",\"radius\":67,\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0xe25e36\",\"strokeStyle\":\"0x79231b\",\"lineWidth\":1,\"angleIndicator\":\"0x79231b\"},\"x\":476.38179433624566,\"y\":293.01047102092167},{\"type\":\"convex-polygon\",\"vertices\":[{\"x\":56,\"y\":0},{\"x\":-27.999999999999986,\"y\":48.49742261192857},{\"x\":-28.000000000000025,\"y\":-48.49742261192855}],\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0x268bd2\",\"strokeStyle\":\"0x0d394f\",\"lineWidth\":1,\"angleIndicator\":\"0x0d394f\"},\"x\":48.905310222358665,\"y\":331.98056461712133},{\"type\":\"rectangle\",\"width\":64.5,\"height\":64,\"restitution\":0.9,\"styles\":{\"fillStyle\":\"0x58c73c\",\"strokeStyle\":\"0x30641c\",\"lineWidth\":1,\"angleIndicator\":\"0x30641c\"},\"x\":152.0965437765946,\"y\":328.48676667480015}]}",
 *         "objectId": "2acbcd69-aa14-4273-8a9f-47642b41ad9d"
 *       },
 *       ...
 *     ]
 **/
exports.findJournalContent = function(req, res) {

	//validate journal  id
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401);
		res.send({
			'error': 'Invalid journal id'
		});
		return;
	}

	// validate on the basis of user's role
	if (req.user.role == 'student') {
		if (req.user._id != uid) {
			res.status(401);
			res.send({
				'error': 'You don\'t have permission to perform this action'
			});
			return;
		}
	}

	//get options
	var options = getOptions(req);

	//get data
	db.collection(journalCollection, function(err, collection) {
		collection.aggregate(options, function(err, items) {

			//define var
			var params = JSON.parse(JSON.stringify(req.query));
			var route = req.route.path;
			var skip = parseInt(req.query.offset || 0);
			var limit = parseInt(req.query.limit || 10);
			var total = items.length;

			//apply pagination
			items = items.slice(skip, (skip + limit));

			//add pagination
			var data = {
				'entries': items,
				'offset': skip,
				'limit': limit,
				'total': total,
				'links': {
					'prev_page': ((skip - limit) >= 0) ? formPaginatedUrl(route, params, (skip - limit), limit) : undefined,
					'next_page': ((skip + limit) < total) ? formPaginatedUrl(route, params, (skip + limit), limit) : undefined,
				},
			}

			// Return
			res.send(data);
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
	return route + '?' + str.join("&");
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
			'objectId': '$content.objectId'
		};

		//based on condition
		if (fields.indexOf('metadata') > -1) qry.metadata = '$content.metadata';
		if (fields.indexOf('text') > -1) qry.text = '$content.text';
		options.push({
			$project: qry
		});
	} else {
		options.push({
			$project: {
				'metadata': '$content.metadata',
				'objectId': '$content.objectId',
				'_id': 0
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
 * @api {post} /Journal/:jid Add entry
 * @apiName AddEntry
 * @apiDescription Add an entry in a journal. Return the entry created. If the entry already exist, update it instead.
 * @apiGroup Journal
 * @apiVersion 0.6.0
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
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.strike Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.file Buddy fill color of the entry creator
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
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401);
		res.send({
			'error': 'Invalid journal id'
		});
		return;
	}
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);

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

							res.status(401);
							res.send({
								'error': 'An error has occurred'
							});
						} else {
							res.send(newcontent);
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
 * @api {put} /Journal/:jid/:oid Update entry
 * @apiName UpdateEntry
 * @apiDescription Update an entry in a journal. Return the entry updated. If the entry don't exist, create a new one instead.
 * @apiGroup Journal
 * @apiVersion 0.6.0
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
 * @apiSuccess {String} metadata.name User name of the entry creator
 * @apiSuccess {Object} metadata.color Buddy color of the entry creator
 * @apiSuccess {String} metadata.color.strike Buddy strike color of the entry creator
 * @apiSuccess {String} metadata.color.file Buddy fill color of the entry creator
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
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401);
		res.send({
			'error': 'Invalid journal id'
		});
		return;
	}
	var jid = req.params.jid;
	var oid = req.query.oid;

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
				res.status(401);
				res.send({
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
 * @api {delete} /Journal/:jid/:oid Remove entry
 * @apiName RemoveEntry
 * @apiDescription Remove an entry in a journal. Return the id of the entry.
 * @apiGroup Journal
 * @apiVersion 0.6.0
 *
 * @apiParam {String} jid Unique id of the journal to update
 * @apiParam {String} oid Unique id of the entry to update
 *
 * @apiSuccess {Object} _pull Container object
 * @apiSuccess {Object} _pull.content Container object
 * @apiSuccess {String} _pull.content.objectId Unique id of the entry removed
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "$pull": {
 *         "content": {
 *           "objectId": "d3c7cfc2-8a02-4ce8-9306-073814a2024e"
 *         }
 *       }
 *     }
 **/
exports.removeEntryInJournal = function(req, res) {
	if (!BSON.ObjectID.isValid(req.params.jid)) {
		res.status(401);
		res.send({
			'error': 'Invalid journal id'
		});
		return;
	}
	var jid = req.params.jid;
	var oid = req.query.oid;
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
				res.status(401);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				res.send(deletecontent);
			}
		});
	});
}

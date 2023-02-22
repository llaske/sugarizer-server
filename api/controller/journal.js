// Journal handling
var mongo = require('mongodb'),
	users = require("./users"),
	streamifier = require('streamifier'),
	fs = require('fs'),
	path = require('path');
var common = require('../controller/utils/common');

var db;

var journalCollection;

var shared = null;

var sugarizerVersion = null;

// eslint-disable-next-line no-unused-vars
var gridfsbucket, CHUNKS_COLL, FILES_COLL;

//- Utility functions
// Extract from https://gist.github.com/kongchen/941a652882d89bb96f87
function _toUTF8(str) {
	var utf8 = [];
	for (var i=0; i < str.length; i++) {
		var charcode = str.charCodeAt(i);
		if (charcode < 0x80) utf8.push(charcode);
		else if (charcode < 0x800) {
			utf8.push(0xc0 | (charcode >> 6),
				0x80 | (charcode & 0x3f));
		}
		else if (charcode < 0xd800 || charcode >= 0xe000) {
			utf8.push(0xe0 | (charcode >> 12),
				0x80 | ((charcode>>6) & 0x3f),
				0x80 | (charcode & 0x3f));
		}
		// surrogate pair
		else {
			i++;
			// UTF-16 encodes 0x10000-0x10FFFF by
			// subtracting 0x10000 and splitting the
			// 20 bits of 0x0-0xFFFFF into two halves
			charcode = 0x10000 + (((charcode & 0x3ff)<<10)
				| (str.charCodeAt(i) & 0x3ff));
			utf8.push(0xf0 | (charcode >>18),
				0x80 | ((charcode>>12) & 0x3f),
				0x80 | ((charcode>>6) & 0x3f),
				0x80 | (charcode & 0x3f));
		}
	}
	return utf8;
}
function _toUTF16(input) {
	var i, str = '';

	for (i = 0; i < input.length; i++) {
		str += '%' + ('0' + input[i].toString(16)).slice(-2);
	}
	str = decodeURIComponent(str);
	return str;
}

// Init database
exports.init = function(settings, database) {

	// Open the journal collection
	journalCollection = settings.collections.journal;

	db = database;
	db.collection(journalCollection, function(err, collection) {
		// Get the shared journal collection
		collection.findOne({
			'shared': true
		}, function(err, item) {
			// Not found, create one
			if (!err && item == null) {
				collection.insertOne({
					content: [],
					shared: true
				}, {
					safe: true
				}, function(err, result) {
					shared = result.ops[0];
				});
			}

			// Already exist, save it
			else if (item != null) {
				shared = item;
			}
		});
	});

	var bucket = 'textBucket';
	gridfsbucket = new mongo.GridFSBucket(db,{
		chunkSizeBytes:102400,
		bucketName: bucket
	});
	CHUNKS_COLL = bucket + ".chunks";
	FILES_COLL = bucket + ".files";



	// Get sugarizer version
	var sugarizerPath = settings.client.path;
	if (sugarizerPath[0] != '/') {
		sugarizerPath = path.join(__dirname + '/../../' + settings.client.path);
	}
	sugarizerPath += ((sugarizerPath[sugarizerPath.length-1] == '/' || sugarizerPath[sugarizerPath.length-1]=='\\') ? '' : '/');
	
	var packageName = 'package.json';
	// Read activities directory

	fs.readdir(sugarizerPath, function(err, files) {
		if (err) {
			console.log("ERROR: can't find sugarizer path '"+sugarizerPath+"'");
			throw err;
		}
		files.forEach(function(file) {
			if (file == packageName) {
				// Get the file name
				var filePath = sugarizerPath + path.sep + file;
				fs.stat(filePath, function(err, stats) {
					if (err) {
						console.log("ERROR: can't read '"+filePath+"'");
						throw err;
					}
					// If it's a directory, it's an activity
					if (!stats.isDirectory()) {
						var sugarizerPackage = require(filePath);
						sugarizerVersion = sugarizerPackage.version;
					}
				});
			}
		});
	});
};

// Get shared journal
exports.getShared = function() {
	return shared;
};

// Create a new journal
exports.createJournal = function(callback) {
	db.collection(journalCollection, function(err, collection) {
		collection.insertOne({
			content: [],
			shared: false
		}, {
			safe: true
		}, callback);
	});
};

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
				new mongo.ObjectID(req.user.private_journal),
				new mongo.ObjectID(req.user.shared_journal)
			]
		};
	}

	if (req.user.role == "teacher") {
		// get student mappings
		users.getAllUsers({
			role: 'student',
			_id: {
				$in: req.user.students.map(function(id) {
					return new mongo.ObjectID(id);
				})
			}
		}, {}, function(users) {
			var journalList = [];
			var map = new Map();
			for (var i=0; i < users.length; i++) {
				if(users[i].private_journal && !map.has(users[i].private_journal)){
					map.set(users[i].private_journal, true);
					journalList.push(users[i].private_journal);
				}
				if(users[i].shared_journal && !map.has(users[i].shared_journal)){
					map.set(users[i].shared_journal, true);
					journalList.push(users[i].shared_journal);
				}
			}
			options['_id'] = {
				$in: journalList
			};
			db.collection(journalCollection, function(err, collection) {
				collection.find(options).toArray(function(err, items) {

					//count
					for (var i=0; i<items.length; i++) {
						if (items[i].shared) {
							items[i].count = 0;
							for (var j=0; j<items[i].content.length; j++) {
								if (items[i].content[j] && items[i].content[j].metadata && items[i].content[j].metadata.user_id && req.user.students.includes(items[i].content[j].metadata.user_id)) {
									items[i].count++;
								}
							}
							delete items[i].content;
						} else {
							items[i].count = items[i].content.length;
							delete items[i].content;
						}
					}

					//return
					res.send(items);
				});
			});
		});
	} else {
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
};

//- REST interface

// Add a new journal
exports.addJournal = function(req, res) {
	exports.createJournal(function(err, result) {
		if (err) {
			res.status(500).send({
				'error': 'An error has occurred',
				'code': 10
			});
		} else {
			res.send(result.ops[0]);
		}
	});
};

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
 *     "/api/v1/journal/5569f4b019e0b4c9525b3c96?aid=org.sugarlabs.Markdown&stime=712786812367"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} jid Unique id of the journal to retrieve
 * @apiParam {String} [aid] filter on activity id <code>e.g. aid=org.sugarlabs.Markdown</code>
 * @apiParam {Boolean} [oid] filter on object id of the activity <code>e.g. oid=4837240f-bf78-4d22-b936-3db96880f0a0</code>
 * @apiParam {String} [uid] filter on user id <code>e.g. uid=5569f4b019e0b4c9525b3c97</code>
 * @apiParam {String} [fields=metadata] field limiting <code>e.g. fields=text,metadata </code>
 * @apiParam {String} [sort=+timestamp] Order of results <code>e.g. sort=-timestamp or sort=-creation_time or sort=-dueDate or sort=-textsize</code>
 * @apiParam {String} [title] entry title contains the text (case insensitive) <code>e.g. title=cTIviTy</code>
 * @apiParam {Number} [stime] results starting from stime in ms <code>e.g. stime=712786812367</code>
 * @apiParam {Boolean} [favorite] filter on favorite field <code>e.g. favorite=true or favorite=false</code>
 * @apiParam {Boolean} [assignment] filter on assignment items <code>e.g. assignment=true or assignment=false</code>
 * @apiParam {String} [offset=0] Offset in results <code>e.g. offset=15</code>
 * @apiParam {String} [limit=10] Limit results <code>e.g. limit=5</code>*
 *
 * @apiSuccess {Object[]} entries List of all entries in the journal.
 * @apiSuccess {Number} offset Offset in journal entries
 * @apiSuccess {Number} limit Limit on number of results
 * @apiSuccess {Number} total total number of results
 * @apiSuccess {Object} link pagination links
 * @apiSuccess {String} version sugarizer version
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
 *           "creation_time": 1423341000747,
 *           "timestamp": 1423341066909,
 *           "file_size": 0,
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
 *           "creation_time": 1436003632237,
 *           "timestamp": 1436025389565,
 *           "file_size": 0,
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
 *     },
 *     "version": 1.2.0-alpha
 *    }
 **/
exports.findJournalContent = function(req, res) {

	//validate journal  id
	if (!mongo.ObjectID.isValid(req.params.jid)) {
		res.status(401).send({
			'error': 'Invalid journal id',
			'code': 11
		});
		return;
	}

	//get options
	var options = getOptions(req);

	//get data
	db.collection(journalCollection, function(err, collection) {
		collection.aggregate(options, function(err, cursor) {
			cursor.toArray(function(err, items) {

				//check for errors
				if (err) {
					return res.status(500).send({
						'error': err,
						'code': 5
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

				var reqCount = 0, resCount = 0;

				for (var i=0; i<items.length; i++) {
					if (items[i] && items[i].text && mongo.ObjectID.isValid(items[i].text)) {
						reqCount++;
						db.collection(CHUNKS_COLL, function(err, collection) {
							var ind = i;
							collection.find({ files_id: items[i].text }).toArray(function(error, docs) {
								items[ind].text = "";
								if (error || (docs && docs.length == 0)) {
									resCount++;
								} else {
									for (var k=0; k<docs.length; k++) {
										items[ind].text += docs[k].data ? docs[k].data.toString("utf8") : "";
										if (k == docs.length - 1) {
											resCount++;
											if (resCount == reqCount) {
												try {
													var textObject = JSON.parse(items[ind].text);
													items[ind].text = textObject.encoding ? _toUTF16(textObject.text) : textObject.text;
												} catch (e) {
													return res.status(500).send({'error': 'Invalid text value', 'code': 12});
												}
												return returnResponse();
											}
										}
									}
								}
								if (resCount == reqCount) {
									try {
										var textObject = JSON.parse(items[ind].text);
										items[ind].text = textObject.text;
									} catch (e) {
										return res.status(500).send({'error': 'Invalid text value', 'code': 12});
									}
									return returnResponse();
								}
								try {
									var textObject = JSON.parse(items[ind].text);
									items[ind].text = textObject.text;
								} catch (e) {
									return res.status(500).send({'error': 'Invalid text value', 'code': 12});
								}
							});
						});
					}
				}

				if (reqCount == 0) {
					returnResponse();
				}

				function returnResponse() {
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
						},
						'version': sugarizerVersion
					});
				}
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
		if (p && Object.prototype.hasOwnProperty.call(params, p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
		}
	return '?' + str.join("&");
}

//form options
function getOptions(req) {

	//form object with journal id
	var options = [{
		$match: {
			'_id': new mongo.ObjectID(req.params.jid)
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
				},
				'insensitive': { "$toLower": "$content.metadata.title" }
			}
		});
	}

	// check for stime filter
	if (req.query.stime) {
		options.push({
			$match: {
				'metadata.timestamp': {
					$gte: parseInt(req.query.stime)
				}
			}
		});
	}

	// check for favorite filter
	if (req.query.favorite) {
		if (req.query.favorite == 'true') {
			options.push({
				$match: {
					'metadata.keep': 1
				}
			});
		} else {
			options.push({
				$match: {
					'metadata.keep': {
						$ne: 1
					}
				}
			});
		}
	}

	// check for assignment filter
	if (req.query.assignment) {
		if (req.query.assignment == 'true') {
			options.push({
				$match: {
					'metadata.assignmentId': {
						$ne: null
					}
				}
			});
		}
	}

	// check for title
	if (req.query.title) {
		options.push({
			$match: {
				'metadata.title': {
					'$regex': req.query.title,
					'$options': 'i'
				}
			}
		});
	}

	//sorting
	var sort_val = (typeof req.query.sort === "string" ? req.query.sort : '+timestamp');
	var sort_type = sort_val.indexOf("-") == 0 ? -1 : 1;
	var sort = {};
	sort_val = 'metadata.' + sort_val.substring(1).toLowerCase();
	if (sort_val == "metadata.title") sort_val = 'insensitive';
	sort[sort_val] = sort_type;
	options.push({
		$sort: sort
	});

	//return
	return options;
}

/**
 * @api {post} api/v1/journal/:jid Add entry
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
 *         "creation_time": 1423341000747,
 *         "timestamp": 1423341000747,
 *         "file_size": 0,
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
	if (!mongo.ObjectID.isValid(req.params.jid) || !req.body.journal) {
		res.status(401).send({
			'error': 'Invalid journal id or entry',
			'code': 12
		});
		return;
	}
	var jid = req.params.jid;
	var journal = JSON.parse(req.body.journal);

	// Look for existing entry with the same objectId
	var filter = {
		'_id': new mongo.ObjectID(jid),
		'content.objectId': journal.objectId
	};
	db.collection(journalCollection, function(err, collection) {
		collection.findOne(filter, function(err, item) {
			if (item == null) {
				// Add a new entry
				if (journal.text) {
					var text = journal.text;
					var utftext = _toUTF8(journal.text);
					var isUtf16 = (journal.text.length != utftext.length);
					var filename = mongo.ObjectId();
					var textContent = JSON.stringify({
						text_type: typeof journal.text,
						text: isUtf16 ? utftext : journal.text,
						encoding: isUtf16
					});

					streamifier.createReadStream(textContent)
						.pipe(gridfsbucket.openUploadStreamWithId(filename, filename.toString()))
						.on('error', function () {
							return res.status(401).send({
								'error': 'An error has occurred',
								'code': 10
							});
						})
						.on('finish', function (uploadStr) {
							journal.text = uploadStr._id;
							updateJournal(req, res, journal, text);
						});
				} else {
					updateJournal(req, res, journal);
				}
			} else {
				// Update the entry
				req.params.oid = journal.objectId;
				exports.updateEntryInJournal(req, res);
			}
		});
	});
};

function updateJournal(req, res, journal, text) {
	var jid = req.params.jid;

	var newcontent = {
		$push: {
			content: journal
		}
	};
	db.collection(journalCollection, function(err, collection) {
		collection.updateOne({
			'_id': new mongo.ObjectID(jid)
		}, newcontent, {
			safe: true
		}, function(err, result) {
			if (err) {
				return res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				if (result && result.result && result.result.n == 1) {
					journal.text = text;
					return res.send(journal);
				} else {
					return res.status(401).send({
						'error': 'An error has occurred',
						'code': 10
					});
				}
			}
		});
	});
}

/**
 * @api {put} api/v1/journal/:jid?oid=:oid Update entry
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
 * @apiParam {String} [oid] Unique id of the entry to update
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
 *         "creation_time": 1423341000747,
 *         "timestamp": 1423341066120,
 *         "file_size": 0,
 *         "user_id": "5569f4b019e0b4c9525b3c97",
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
	if (!mongo.ObjectID.isValid(req.params.jid) || !req.query.oid) {
		res.status(401).send({
			'error': 'Invalid journal or object id',
			'code': 13
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
		collection.findOneAndUpdate({
			'_id': new mongo.ObjectID(jid)
		}, deletecontent, {
			safe: true,
			returnNewDocument: false
		}, function(err, doc) {
			if (err) {
				return res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else if (doc && doc.value && typeof doc.value.content == 'object') {
				var cont = [];
				for (var i=0; i<doc.value.content.length; i++) {
					if (doc.value.content[i] && doc.value.content[i].objectId == oid && mongo.ObjectID.isValid(doc.value.content[i].text)) {
						cont.push(doc.value.content[i].text);
					}
				}
				var deleteCount = 0;
				for (var i=0; i < cont.length; i++) {
					gridfsbucket.delete(cont[i], function() {
						deleteCount++;
						if (deleteCount == cont.length) exports.addEntryInJournal(req, res);
					});
				}
				if (cont.length == 0) exports.addEntryInJournal(req, res);
			} else {
				// Add the updated entry
				exports.addEntryInJournal(req, res);
			}
		});
	});
};

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
	if (!mongo.ObjectID.isValid(req.params.jid)) {
		res.status(401).send({
			'error': 'Invalid journal id',
			'code': 11
		});
		return;
	}
	var jid = req.params.jid;
	var oid = (req.query.oid) ? req.query.oid : false;
	var type = (req.query.type) ? req.query.type : 'partial';

	//whether or partial is deleted!
	if (type == 'full') {
		db.collection(journalCollection, function(err, collection) {
			collection.findOneAndDelete({
				'_id': new mongo.ObjectID(jid)
			}, function(err, result) {
				if (err) {
					return res.status(500).send({
						'error': 'An error has occurred',
						'code': 10
					});
				} else {
					if (result && result.value && result.ok) {
						if (typeof result.value.content == 'object') {
							var cont = [];
							for (var i=0; i<result.value.content.length; i++) {
								if (result.value.content[i] && mongo.ObjectID.isValid(result.value.content[i].text)) {
									cont.push(result.value.content[i].text);
								}
							}
							var deleteCount = 0;
							for (var i=0; i < cont.length; i++) {
								gridfsbucket.delete(cont[i], function() {
									deleteCount++;
									if (deleteCount == cont.length) return res.send({
										'jid': jid
									});
								});
							}
							if (cont.length == 0) return res.send({
								'jid': jid
							});
						} else {
							return res.send({
								'jid': jid
							});
						}
					} else {
						return res.status(401).send({
							'error': 'Error while deleting journal!',
							'code': 14
						});
					}
				}
			});
		});
	} else {
		if (oid) {
			db.collection(journalCollection, function(err, collection) {
				collection.findOneAndUpdate({
					'_id': new mongo.ObjectID(jid)
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
							'error': 'An error has occurred',
							'code': 10
						});
					} else {
						if (result && result.value && result.ok) {
							if (typeof result.value.content == 'object') {
								var cont = [];
								for (var i=0; i<result.value.content.length; i++) {
									if (result.value.content[i] && result.value.content[i].objectId == oid && mongo.ObjectID.isValid(result.value.content[i].text)) {
										cont.push(result.value.content[i].text);
									}
								}
								var deleteCount = 0;
								for (var i=0; i < cont.length; i++) {
									gridfsbucket.delete(cont[i], function() {
										deleteCount++;
										if (deleteCount == cont.length) return res.send({
											'objectId': oid
										});
									});
								}
								if (cont.length == 0) return res.send({
									'objectId': oid
								});
							} else {
								return res.send({
									'objectId': oid
								});
							}
						} else {
							return res.status(401).send({
								'error': 'Error while deleting journal entry!',
								'code': 15
							});
						}

					}
				});
			});
		} else {
			return res.status(401).send({
				'error': 'Invalid Object ID',
				'code': 16
			});
		}
	}
};

/**
 * @api {get} api/v1/aggregate Get all journals with entries
 * @apiName GetAllJournalEntries
 * @apiDescription It will get all the journals with their entries present in the database. Private and shared can be filtered using the "type" query param. If the param is not specified, it will get all the journals.
 * @apiGroup Journal
 * @apiVersion 1.2.0
 *
 * @apiExample Example usage:
 *     "/api/v1/aggregate"
 *     "/api/v1/aggregate?type=shared"
 *     "/api/v1/aggregate?type=private"
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} [type] Type of the journal (shared or private)
 *
 * @apiSuccess {String} _id Unique id of the journal
 * @apiSuccess {Object} content Array containing data of the entries
 * @apiSuccess {Object} content[i].metadata Metadata of the entries, i.e. characteristics of the entry
 * @apiSuccess {String} content[i].objectId Unique id of the entry in the journal
 * @apiSuccess {String} content[i].objectId Unique id of the entry in the journal
 * @apiSuccess {String} content[i].text Text of the entries, i.e. storage value of the entry. It depends of the entry type
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
 *       "_id": "5946d4fc9f0e36686c50a548",
 *       "content": [
 *        {
 *         "metadata": {
 *          "title": "Read me !",
 *          "title_set_by_user": "0",
 *          "activity": "org.sugarlabs.Markdown",
 *          "activity_id": "caa97e48-d33c-470a-99e9-495ff02afe01",
 *          "creation_time": 1423341000747,
 *          "timestamp": 1423341066909,
 *          "file_size": 0,
 *          "user_id": "5569f4b019e0b4c9525b3c97",
 *          "buddy_name": "Sugarizer server",
 *          "buddy_color": {
 *           "stroke": "#005FE4",
 *           "fill": "#FF2B34"
 *          }
 *         },
 *         "objectId": "4837240f-bf78-4d22-b936-3db96880f0a0",
 *         "text" : ""
 *        },
 *        {
 *         "metadata": {
 *          "title": "Physics JS Activity",
 *          "title_set_by_user": "0",
 *          "activity": "org.olpg-france.physicsjs",
 *          "activity_id": "43708a15-f48e-49b1-85ef-da4c1419b364",
 *          "creation_time": 1436003632237,
 *          "timestamp": 1436025389565,
 *          "file_size": 0,
 *          "user_id": "5569f4b019e0b4c9525b3c97",
 *          "buddy_name": "Lionel",
 *          "buddy_color": {
 *           "stroke": "#00A0FF",
 *           "fill": "#F8E800"
 *          }
 *         },
 *         "objectId": "2acbcd69-aa14-4273-8a9f-47642b41ad9d",
 *         "text" : ""
 *        },
 *        ...
 *       ],
 *       "shared": true
 *      },
 *      {
 *       "_id": "5954089e088a9fd957734e46",
 *       "content": [
 *        {
 *         "metadata" : {
 *          "title" : "Paint Activity",
 *          "title_set_by_user" : "0",
 *          "activity" : "org.olpcfrance.PaintActivity",
 *          "activity_id" : "c3863442-f524-4d17-868a-9eed8fb467e5",
 *          "creation_time" : 1522441628767,
 *          "timestamp" : 1522441631568,
 *          "file_size" : 0,
 *          "buddy_name" : "Local",
 *          "buddy_color" : {
 *           "stroke" : "#00B20D",
 *           "fill" : "#00EA11"
 *           },
 *           "textsize" : 28687,
 *           "user_id" : "5a9d84682feba60e001ee997"
 *         },
 *         "objectId" : "e02da731-690b-4347-8ae2-e8e88a692999",
 *         "text" : ""
 *        }
 *       ],
 *       "shared": false
 *      }
 *     ]
 **/
exports.findAllEntries = function(req, res) {
	// set options
	var options = {};
	if (req.query.type == 'shared') {
		options.shared = true;
	} else if (req.query.type == 'private') {
		options.shared = false;
	}

	if (req.user.role == "teacher") {
		// get student mappings
		users.getAllUsers({
			role: 'student',
			_id: {
				$in: req.user.students.map(function(id) {
					return new mongo.ObjectID(id);
				})
			}
		}, {}, function(users) {
			var journalList = [];
			var map = new Map();
			for (var i=0; i < users.length; i++) {
				if(users[i].private_journal && !map.has(users[i].private_journal)){
					map.set(users[i].private_journal, true);
					journalList.push(users[i].private_journal);
				}
				if(users[i].shared_journal && !map.has(users[i].shared_journal)){
					map.set(users[i].shared_journal, true);
					journalList.push(users[i].shared_journal);
				}
			}
			options['_id'] = {
				$in: journalList
			};
			db.collection(journalCollection, function(err, collection) {
				collection.find(options).toArray(function(err, items) {
					//check for errors
					if (err) {
						return res.status(500).send({
							'error': err,
							'code': 5
						});
					}
					//count
					for (var i=0; i<items.length; i++) {
						if (items[i].shared && typeof items[i].content == "object") {
							var content = [];
							for (var j=0; j<items[i].content.length; j++) {
								if (items[i].content[j] && items[i].content[j].metadata && items[i].content[j].metadata.user_id && req.user.students.includes(items[i].content[j].metadata.user_id)) {
									delete items[i].content[j].text;
									content.push(items[i].content[j]);
								}
							}
							items[i].content = content;
						}
					}
					return res.send(items);
				});
			});
		});
	} else {
		//get data
		db.collection(journalCollection, function(err, collection) {
			collection.find(options).toArray(function(err, items) {
				//check for errors
				if (err) {
					return res.status(500).send({
						'error': err,
						'code': 5
					});
				}

				// Delete the text field from the data
				for (var i=0; i<items.length; i++) {
					if (typeof items[i].content == "object") {
						for (var j=0; j<items[i].content.length; j++) {
							if (items[i].content[j] && items[i].content[j].text) {
								delete items[i].content[j].text;
							}
						}
					}
				}

				// Return
				return res.send(items);
			});
		});
	}
};

exports.copyEntry = function (initialDoc, chunks, uniqueStudents) {
	return new Promise(function (resolve, reject) {
		var error = new Error("Entry not found");
		if (typeof initialDoc == "undefined") {
			reject(error);
		}
		var entryDoc = JSON.parse(JSON.stringify(initialDoc));
		var text = "";
		for (var i = 0; i < chunks.length; i++) {
			text += chunks[i].data ? chunks[i].data.toString("utf8") : "";
		}
		entryDoc.text = text;
		var textObject = JSON.parse(entryDoc.text);
		entryDoc.text = textObject.encoding ? _toUTF16(textObject.text) : textObject.text;

		var utftext = _toUTF8(entryDoc.text);
		var isUtf16 = (entryDoc.text.length != utftext.length);
		var filename = mongo.ObjectId();
		var textContent = JSON.stringify({
			text_type: typeof entryDoc.text,
			text: isUtf16 ? utftext : entryDoc.text,
			encoding: isUtf16
		});

		streamifier.createReadStream(textContent)
			.pipe(gridfsbucket.openUploadStreamWithId(filename, filename.toString()))
			.on('error', function () {
				reject(new Error("Failed to write journal entry"));
			}).on('finish', function (uploadStr) {
				entryDoc.text = uploadStr._id;
				entryDoc.metadata.user_id = uniqueStudents._id;
				entryDoc.metadata.buddy_name = uniqueStudents.name;
				var objectId = common.createUUID();
				if (typeof entryDoc == "object") {
					entryDoc.objectId = objectId;
				}
				resolve({copy: entryDoc, student: uniqueStudents});
			});

	});
};

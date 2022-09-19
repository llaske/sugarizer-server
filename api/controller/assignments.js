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

//add assignments
exports.addAssignment = function (req, res) {
    //validate
    if (!req.body.assignment) {
        return res.status(400).send({
            'error': "Assignment object is not defined",
            'code': 22
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
            res.status(200).send(result.ops[0]);
        });
    });
};

//find All assignments 
exports.findAll = function (req, res) {
    var query = {};

    query = addQuery("name", req.query, query);
    query = addQuery("isAssigned", req.query, query);
    query = addQuery("terminated", req.query, query);
    db.collection(assignmentCollection, function (err, collection) {
        //count
        collection.countDocuments(query, function (err, count) {
            var params = JSON.parse(JSON.stringify(req.query));
            var route = req.route.path;
            var options = getOptions(req, count, "+name");
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
            //find
            collection.aggregate(conf).toArray(function (err, items) {
                if (options.skip) {
                    items.skip(options.skip);
                }
                if (err) {
                    return res.status(500).send({
                        error: "An error has occurred",
                        code: 10
                    });
                }
                //find journal entries bt _id and objectId with aggregate
                db.collection(journalCollection, function (err, collection) {
                    if (err) {
                        return res.status(500).send({
                            error: "Error accessing database",
                            code: 23
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
                                error: "Error accessing database",
                                code: 23
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
                        res.status(200).send(data);
                    });
                });
            });
        });
    });
};

//find all deliveries
exports.findAllDeliveries = function (req, res) {
    var assignmentId = req.params.assignmentId;
    //validate
    if (!mongo.ObjectID.isValid(assignmentId)) {
        return res.status(401).send({
            'error': "Invalid assignment id",
            'code': 23
        });
    }
    //find all deliveries with filters and pagination
    var query = {};
    query = addQuery("buddy_name", req.query, query);
    db.collection(journalCollection, function (err, collection) {
        //count
        collection.countDocuments(query, function (err, count) {
            var params = JSON.parse(JSON.stringify(req.query));
            var route = req.route.path;
            var options = getOptions(req, count, "+buddy_name");
            //find all entries which matches with assignment id using aggregation
            collection.aggregate([
                {
                    $match: {
                        "content.metadata.assignmentId": assignmentId
                    }
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
                        },
                    }
                },
                {
                    $sort: {
                        "content.metadata.buddy_name": 1
                    }
                }

            ]).toArray(function (err, items) {
                if (err) {
                    return res.status(500).send({
                        error: "An error has occurred",
                        code: 10
                    });
                } else {
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
                    res.send(data);
                }
            });
        });
    });
};

//find assignment by id
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
                return res.status(401).send({});
            }
            //find classrooms
            db.collection(classroomCollection, function (err, collection) {
                if (err) {
                    return res.status(500).send({
                        error: "Error accessing database",
                        code: 23
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
                    if (!classrooms) {
                        return res.status(404).send({
                            'error': "Classrooms not found",
                            'code': 34
                        });
                    } else {
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
                                res.status(200).send(assignment);
                            });
                        });
                    }
                });
            });
        });
    });
};

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
                    'code': 23
                });
            }
            if (!assignment) {
                return res.status(401).send({});
            }
            else {
                //find all students from classrooms
                var classrooms = assignment.classrooms;
                var privateJournalIds = []; //to store private journal ids of every student
                //get students private_journal
                common.fetchAllStudents(classrooms).then(function (stds) {
                    var uniqueJournalIds = [];
                    if(stds.length <= 0){
                        return res.status(400).send({
                            'error': 'No students found',
                            'code': 37
                        });
                    }
                    //make set for getting unique values of private_journal
                    var uniqueJournalIdsSet = new Set();
                    for (var i = 0; i < stds.length; i++) {
                        if (!uniqueJournalIdsSet.has(stds[i].private_journal.toString())) {
                            uniqueJournalIdsSet.add(stds[i].private_journal.toString());
                        }
                    }
                    //getting unique values of _id and name
                    var arr = [];
                    var uniqueStudents = [];
                    for (var i = 0; i < stds.length; i++) {
                        arr.push({ _id: stds[i]._id, name: stds[i].name });
                    }
                    var uniqueStudentsSet = new Set();
                    arr.forEach(obj => (
                        !uniqueStudentsSet.has(obj) && uniqueStudentsSet.add(JSON.stringify(obj))
                    ))
                    uniqueStudentsSet = new Set([...uniqueStudentsSet].map(o => JSON.parse(o)))
                    //convert set to array
                    uniqueJournalIds = Array.from(uniqueJournalIdsSet);
                    uniqueStudents = Array.from(uniqueStudentsSet);
                    privateJournalIds = uniqueJournalIds;
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
                                    } else {
                                        return res.status(404).send({
                                            'error': "Entry not found",
                                            'code': 36
                                        });
                                    }
                                    updateEntries(entry[0].content[0], privateJournalIds, uniqueStudents).then(function (result) {
                                        updateStatus(req.params.assignmentId, "Assigned", entry[0].content[0].objectId, function (err, result) {
                                            if (err) {
                                                return res.status(500).send({
                                                    'error': "An error has occurred",
                                                    'code': 10
                                                });
                                            } else {
                                                res.status(200).send(result);
                                            }
                                        });
                                        res.status(200).send((result).toString());
                                    }).catch(function () {
                                        res.status(500).send({
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
function updateEntries(entryDoc, privateJournalIds, uniqueStudents) {
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
                        for (var counter = 0, i = 0, j = 0; i < privateJournalIds.length; i++) {
                            // add objectid
                            journal.copyEntry(entryDoc, chunks, uniqueStudents[i]).then(function (copy) {
                                db.collection(journalCollection, function (err, collection) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        collection.updateOne(
                                            {
                                                _id: new mongo.ObjectID(privateJournalIds[j++])
                                            },
                                            {
                                                $push:
                                                {
                                                    "content": copy
                                                }
                                            }, function (err) {
                                                counter++;
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    if (counter == privateJournalIds.length) return resolve(counter);
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

//delete assignment
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
                    res.status(500).send({
                        error: "An error has occurred",
                        code: 10
                    });
                } else {
                    if (result && result.result && result.result.n == 1) {
                        res.status(200).send({
                            id: req.params.assignmentId
                        });
                    } else {
                        res.status(401).send({
                            error: "Inexisting assignment id",
                            code: 23
                        });
                    }
                }
            });
    });
};

// update assignment
exports.updateAssignment = function (req, res) {
    //validate
    if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
        return res.status(401).send({
            'error': "Invalid assignment id",
            'code': 35
        });
    }
    if (!req.params.assignmentId) {
        return res.status(400).send({
            'error': "Assignment id is not defined",
            'code': 22
        });
    }
    var assignmentId = req.params.assignmentId;
    var assignment = JSON.parse(req.body.assignment);
    //add timestamp
    assignment.timestamp = +new Date();
    //find assignment by id
    db.collection(assignmentCollection, function (err, collection) {
        //count data
        collection.countDocuments(
            {
                '_id': {
                    $ne: new mongo.ObjectID(assignmentId)
                },
                'name': new RegExp("^" + assignment.name + "$", "i")
            }
            , function (err, count) {
                if (err) {
                    res.send({ 'error': 'An error has occurred in finding assignment' });
                } else {
                    if (count == 0) {
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
                                        error: "An error has occurred",
                                        code: 10
                                    });
                                } else {
                                    if (result && result.result && result.result.n == 1) {
                                        res.send({
                                            id: assignmentId
                                        });
                                    } else {
                                        res.status(401).send({
                                            error: "Inexisting assignment id",
                                            code: 23
                                        });
                                    }
                                }
                            });
                    } else {
                        return res.status(401).send({
                            error: "Assignment already exists",
                            code: 24
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
            if(params[filter] == "true"){
                query["isAssigned"] = {
                    $eq: true
                }
                //also checking dueDate is greater than current date.
                query["dueDate"] = {
                    $gte: new Date().getTime()
                }
            } 
            if(params[filter] == "false"){
                query["isAssigned"] = {
                    $eq: false
                }
            }
        } else if (filter == "terminated") {
            query["dueDate"] = {
                $lte : new Date().getTime()
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
            function (err, result) {
                if (err) {
                    return res.status(401).send({
                        error: "An error has occurred",
                        code: 10
                    });
                }
                if (!result) {
                    return res.status(401).send({});
                }
                else {
                    return res.status(200).send(result);
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
                    res.send(result);
                }
            });
    });
}

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
            res.status(200).send(result);
        }
        else {
            res.status(500).send({
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
                    res.send(result);
                }
            });
    });
}

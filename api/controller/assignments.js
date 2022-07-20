/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
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

//add assignments
exports.addAssignment = function (req, res) {
    //validate
    if (!req.body.assignment) {
        res.status(400).send({
            error: "Assignment object is not defined",
            code: 22
        });
        return;

    }
    //parse assignment details
    var assignment = JSON.parse(req.body.assignment);
    //add timestamps
    assignment.created_time = +new Date();
    assignment.timestamp = +new Date();
    assignment.created_by = req.user._id;
    assignment.journal_id = req.user.private_journal;
    assignment.isAssigned = false;

    if (typeof assignment == 'boolean' || assignment.name == "" || assignment.classrooms == "" || assignment.dueDate == "" || assignment.instructions == "") {
        return res.status(400).send({
            error: "Please fill all the fields",
            code: 21
        });

    }

    //add assignment to database with unique name
    db.collection(assignmentCollection, function (err, collection) {
        if (err) {
            return res.status(500).send({
                error: "Error accessing database",
                code: 23
            });

        }
        collection.findOne({ name: assignment.name }, function (err, item) {
            if (err) {
                return res.status(500).send({
                    error: "An error has occurred",
                    code: 10
                });

            }
            if (item) {
                return res.status(400).send({
                    error: "Assignment with this name already exists",
                    code: 34
                });

            }
            collection.insertOne(assignment, { safe: true }, function (err, result) {
                if (err) {
                    return res.status(500).send({
                        error: "An error has occurred",
                        code: 10
                    });

                }
                if (result && result.result && result.result.n == 1) {
                    res.status(200).send(result.ops[0]);
                }

            }
            );
        });
    }
    );
};

//find All assignments 
exports.findAll = function (req, res) {
    //find all assignments with filters and pagination
    var params = {};
    if (req.query.filter) {
        params = JSON.parse(req.query.filter);
    }
    db.collection(assignmentCollection, function (err, collection) {
        //count
        collection.countDocuments(params, function (err, count) {
            var params = JSON.parse(JSON.stringify(req.query));
            var route = req.route.path;
            var options = getOptions(req, count, "+_id");

            //find
            console.log(params);
            collection.find(params, options).toArray(function (err, items) {
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
    console.log("assignmentId", assignmentId);
    //validate
    if (!mongo.ObjectID.isValid(assignmentId)) {
        res.status(401).send({
            error: "Invalid assignment id",
            code: 23
        });
        return;
    }

    if (!assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }
    //find all deliveries with filters and pagination
    var params = {};
    if (req.query.filter) {
        params = JSON.parse(req.query.filter);
    }
    db.collection(journalCollection, function (err, collection) {
        //count
        collection.countDocuments(params, function (err, count) {
            var params = JSON.parse(JSON.stringify(req.query));
            var route = req.route.path;
            var options = getOptions(req, count, "+assignmentId");

            //find all entries whic match with assignment id using aggregate
            collection.aggregate([
                {
                    $match: {

                        "content.metadata.assignmentId": assignmentId
                    }
                },
                {
                    $project: {
                        _id: 0,
                        content: {
                            $filter: {
                                input: "$content",
                                as: "item",
                                cond: { $eq: ["$$item.metadata.assignmentId", assignmentId] }
                            }
                        }
                    }
                },
            ]).toArray(function (err, items) {
                console.log(items);
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
    //find assignment by id
    var assignmentId = req.params.assignmentId;
    db.collection(assignmentCollection, function (err, collection) {
        if (err) {
            return res.status(500).send({
                error: "Error accessing database",
                code: 23
            });
        }
        collection.findOne({ _id: new mongo.ObjectID(assignmentId) }, function (err, item) {
            if (err) {
                return res.status(500).send({
                    error: "An error has occurred",
                    code: 10
                });
            }
            if (!item) {
                return res.status(404).send({
                    error: "Assignment not found",
                    code: 34
                });
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
                            $in: item.classrooms.map(function (classroom) {
                                return new mongo.ObjectID(classroom);
                            })
                        }
                    }
                ).toArray(function (err, classrooms) {
                    if (err) {
                        return res.status(500).send({
                            error: "An error has occurred",
                            code: 10
                        });
                    }
                    if (!classrooms) {
                        return res.status(404).send({
                            error: "Classrooms not found",
                            code: 34
                        });
                    } else {

                        item.classrooms.map(function (class_id) {
                            classrooms.map(function (classroom) {
                                if (classroom._id.toString() == class_id) {
                                    item.classrooms.splice(item.classrooms.indexOf(class_id), 1, classroom);
                                }
                            });
                        });

                        db.collection(journalCollection, function (err, collection) {
                            collection.find(
                                {
                                    _id: new mongo.ObjectID(item.journal_id)
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
                                        error: "An error has occurred",
                                        code: 10
                                    });
                                }
                                console.log(journals[0].content);
                                //add assigned work to assignment
                                item.assignedWork = journals[0].content[0];

                                console.log(item);
                                res.send(item);
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
    if (!req.params.assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }

    //find assignment by id
    db.collection(assignmentCollection, function (err, collection) {
        collection.findOne({ _id: new mongo.ObjectID(req.params.assignmentId) }, function (err, assignment) {
            if (err) {
                res.send({ 'error': 'An error has occurred in finding assignment' });
            } else {
                //find all students from classrooms
                var classrooms = assignment.classrooms;
                var privateJournalIds = []; //to store private journal ids of every student

                //get students private_journal
                common.fetchAllStudents(classrooms).then(function (stds) {
                    var uniqueJournalIds = [];
                    //make set for getting unique values of private_journal
                    var uniqueJournalIdsSet = new Set();
                    for (var i = 0; i < stds.length; i++) {
                        if (!uniqueJournalIdsSet.has(stds[i].private_journal.toString())) {
                            uniqueJournalIdsSet.add(stds[i].private_journal.toString());
                        } ``;
                    }
                    //convert set to array
                    uniqueJournalIds = Array.from(uniqueJournalIdsSet);
                    privateJournalIds = uniqueJournalIds;

                    db.collection(journalCollection, function (err, collection) {
                        if (err) {
                            res.send({ "error": "An error has occurred in finding journal Entry" });
                        } else {
                            //find entry by private_journal and ObjectID

                            //aggregate query to get entry on the bisis of private_journal and objectId
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
                                    res.send({ "error": "An error has occurred in finding journal Entry" });
                                } else {
                                    // adding assignment metadata to entry
                                    console.log(entry);
                                    if (entry.length > 0) {
                                        entry[0].content[0].metadata.assignmentId = req.params.assignmentId;
                                        entry[0].content[0].metadata.submissionDate = null;
                                        entry[0].content[0].metadata.isSubmitted = false;
                                        entry[0].content[0].metadata.status = null;
                                        entry[0].content[0].metadata.comment = "";

                                    }
                                    try {
                                        updateEntries(entry[0].content[0], privateJournalIds).then(function (result) {
                                            updateStatus(req, res, "Assigned", entry[0].content[0].objectId);
                                            res.send(result);

                                        });
                                    }
                                    catch (err) {
                                        res.status(500).send({
                                            error: "An error has occurred",
                                            code: 10
                                        });
                                    }
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
function updateEntries(entryDoc, privateJournalIds) {
    return new Promise(function (resolve, reject) {
        for (var counter = 0, i = 0, j = 0; i < privateJournalIds.length; i++) {
            // add objectid
            journal.copyEntry(entryDoc).then(function (copy) {
                console.log("copy", copy);
                db.collection(journalCollection, function (err, collection) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(privateJournalIds[j]);
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
                                    if (counter == privateJournalIds.length) return resolve(copy);
                                }
                            });
                    }
                });
            }).catch(function (err) {
                reject(err);
            }
            );


            console.log({ "assignment": entryDoc });
            //update entry


        }
    });
}

//delete assignment
exports.removeAssignment = function (req, res) {
    //validate
    if (!req.params.assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
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
                        res.send({
                            id: req.params.assignmentId
                        });
                    } else {
                        res.status(401).send({
                            error: "Inexisting assignment id",
                            code: 23
                        });
                    }
                }
            }
        );
    });
};

// update assignment
exports.updateAssignment = function (req, res) {
    //validate
    if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
        res.status(401).send({
            error: "Invalid assignment id",
            code: 23
        });
        return;
    }
    if (!req.params.assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
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
                                    res.send(result);
                                }
                            }
                        );
                    } else {
                        return res.status(400).send({
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

//update comment 
exports.updateComment = function (req, res) {
    //validate
    if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
        res.status(401).send({
            error: "Invalid assignment id",
            code: 23
        });
        return;
    }
    if (!req.params.assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }
    var assignmentId = req.params.assignmentId;
    var comment = JSON.parse(req.body.comment);
    if (!req.query.oid) {
        return res.status(401).send({
            error: "Invalid object id",
            code: 23
        });
    }
    var objectId = req.query.oid;

    try {
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
                        console.log(err);
                        return res.status(500).send({
                            error: "An error has occurred",
                            code: 10
                        });
                    } else {
                        console.log(result);
                        res.send(result);
                    }
                }
            );
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            error: "An error has occurred",
            code: 10
        });
    }
};

function updateStatus(req, res, status, objectId) {
    //validate
    if (!mongo.ObjectID.isValid(req.params.assignmentId)) {
        res.status(401).send({
            error: "Invalid assignment id",
            code: 23
        });
        return;
    }
    if (!req.params.assignmentId) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }
    var assignmentId = req.params.assignmentId;


    if (status == "Assigned") {
        db.collection(assignmentCollection, function (err, collection) {
            collection.findOneAndUpdate(
                {
                    '_id': new mongo.ObjectID(assignmentId)
                },
                {  //set comment only if it is match with objectId
                    $set: {
                        'isAssigned': true,
                    }
                },
                {
                    safe: true,
                },
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({
                            error: "An error has occurred",
                            code: 10
                        });
                    } else {
                        console.log(result);
                        res.send(result);
                    }
                }
            );
        });
    }


    if (status == "Delivered") {
        try {
            db.collection(journalCollection, function (err, collection) {
                collection.findOneAndUpdate(
                    {
                        'content.objectId': objectId,
                        'content.metadata.assignmentId': assignmentId,
                    },
                    {  //set comment only if it is match with objectId
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
                            console.log(err);
                            return res.status(500).send({
                                error: "An error has occurred",
                                code: 10
                            });
                        } else {
                            console.log(result);
                            res.send(result);
                        }
                    }
                );
            });
        } catch (err) {
            console.log(err);
            return res.status(500).send({
                error: "An error has occurred",
                code: 10
            });
        }
    }
}




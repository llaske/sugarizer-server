/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
//assignments handling 
var mongo = require('mongodb');
var common = require('./utils/common');
var db;
var assignmentCollection;
var journalCollection;

exports.init = function (settings, database) {
    assignmentCollection = settings.collections.assignments;
    journalCollection = settings.collections.journal;
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

    //parse user details
    console.log(req.body);
    var assignment = JSON.parse(req.body.assignment);

    //add timestamps
    assignment.created_time = +new Date();
    assignment.timestamp = +new Date();
    assignment.created_by = req.user._id;

    //add assignment to database with unique name
    db.collection(assignmentCollection, function (err, collection) {
        if (err) {
            res.status(500).send({
                error: "Error accessing database",
                code: 23
            });
            return;
        }
        collection.findOne({ name: assignment.name }, function (err, item) {
            if (err) {
                res.status(500).send({
                    error: "Error accessing database",
                    code: 23
                });
                return;
            }
            if (item) {
                res.status(400).send({
                    error: "Assignment with this name already exists",
                    code: 24
                });
                return;
            }
            collection.insertOne(assignment, { safe: true }, function (err, result) {
                if (err) {
                    res.status(500).send({
                        error: "Error accessing database",
                        code: 23
                    });
                    return;
                }
                res.send(result.ops[0]);
            }
            );
        });
    }
    );
};

//find All assignments 
exports.findAll = function (req, res) {
    //find all assignments 
    db.collection(assignmentCollection, function (err, collection) {
        if (err) {
            res.send({ 'error': 'An error has occurred in finding assignments' });
        } else {
            collection.find().toArray(function (err, items) {
                res.send(items);

            });
        }
    });
};

exports.launchAssignment = function (req, res) {
    //validate
    if (!req.params.assingid) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }

    //find assignment by id
    db.collection(assignmentCollection, function (err, collection) {
        collection.findOne({ _id: new mongo.ObjectID(req.params.assingid) }, function (err, assignment) {
            if (err) {
                res.send({ 'error': 'An error has occurred in finding assignment' });
            } else {
                var assignmentData;
                assignmentData = assignment;
                //find all students from classrooms
                var classrooms = assignmentData.classrooms;
                var privateJournalIds = []; //to store private journal ids of every student
                var students = []; //to store all students data 


                //get students private_journal
                common.fetchAllStudents(classrooms).then(function (stds) {
                    //student data
                    students = students.concat(stds);

                    //getting priavte journal ids from every student id
                    var uniqueJournalIds = [];
                    for (var i = 0; i < stds.length; i++) {
                        if (uniqueJournalIds.indexOf(stds[i].private_journal.toString()) == -1) {
                            uniqueJournalIds.push(stds[i].private_journal.toString());
                        }
                    }

                    privateJournalIds = uniqueJournalIds;
                    var entryDoc = {};

                    db.collection(journalCollection, function (err, collection) {
                        if (err) {
                            res.send({ "error": "An error has occurred in finding journal Entry" });
                        } else {
                            //find entry by private_journal and ObjectID
                            console.log(assignmentData.assignedWork.toString());
                            //aggregate query to get entry on the bisis of private_journal and objectId
                            collection.aggregate([
                                {
                                    $match: {
                                        '_id': new mongo.ObjectID(req.user.private_journal),
                                        "content.objectId": assignmentData.assignedWork
                                    }
                                },
                                {
                                    $unwind: "$content"
                                },
                                {
                                    $match: {
                                        "content.objectId": assignmentData.assignedWork
                                    }
                                }
                            ]).toArray(function (err, entry) {
                                entryDoc = entry[0].content;
                                console.log(entryDoc);
                                // adding assignment metadata to entry
                                entryDoc.metadata.assignmentId = req.params.assingid;
                                entryDoc.metadata.submissionDate = null;
                                entryDoc.metadata.isSubmitted = false;

                                for (var i = 0; i < privateJournalIds.length; i++) {
                                    entryDoc = createEntry(entryDoc);
                                    console.log(entryDoc);
                                    updateEntry(entryDoc, privateJournalIds[i], res).then(function (result) {
                                        //send data to client
                                        res.send({
                                            'result': result,
                                            'entry': entryDoc,
                                        });
                                    }).catch(function (err) {
                                        res.send({
                                            "error": err
                                        });
                                    });
                                }

                            });

                        }

                    });
                }).catch(function (err) {
                    console.log(err);
                    res.send({ 'error': err });
                });

            }

        });
    });
};


function createEntry(entryDoc) {
    var objectId = common.createUUID();
    if (typeof entryDoc == "object") {
        entryDoc.objectId = objectId;
    }
    return entryDoc;
}

function updateEntry(entryDoc, privateJournalId) {
    return new Promise(function (resolve, reject) {
        db.collection(journalCollection, function (err, collection) {
            collection.updateOne(
                {
                    _id: new mongo.ObjectID(privateJournalId)
                },
                {
                    $push: {
                        "content": entryDoc
                    }

                },
                function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );

        });
    });
}

exports.removeAssignment = function (req, res) {
    //validate
    if (!req.params.assingid) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }

    db.collection(assignmentCollection, function (err, collection) {
        collection.deleteOne(
            {
                _id: new mongo.ObjectID(req.params.assingid)
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
                            id: req.params.assingid
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

exports.updateAssignment = function (req, res) {
    //validate
    if (!req.params.assingid) {
        res.status(400).send({
            error: "Assignment id is not defined",
            code: 22
        });
        return;
    }
    var assingid = req.params.assingid;
    console.log(req.body.assignment);
    var assignment = JSON.parse(req.body.assignment);

    //add timestamp
    assignment.timestamp = +new Date();

    //find assignment by id
    db.collection(assignmentCollection, function (err, collection) {
        //count data
        collection.countDocuments(
            {
                '_id': {
                    $ne: new mongo.ObjectID(assingid)
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
                                _id: new mongo.ObjectID(req.params.assingid)
                            },
                            {
                                $set: assignment
                            },
                            function (err, result) {
                                if (err) {
                                    res.send({ 'error': 'An error has occurred in finding assignment' });
                                } else {
                                    res.send(result);
                                }
                            }
                        );
                    } else {
                        res.send({ 'error': 'Inexisting assignment' });
                    }
                }
            });
    });
};



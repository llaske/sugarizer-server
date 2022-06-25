//assignments handling 
var mongo = require('mongodb');
var classrooms = require('./classrooms');
var common = require('./utils/common');


var db;
var assignmentCollection;
var classroomCollection
var userCollection
var journalCollection

exports.init = function(settings, database){
    assignmentCollection = settings.collections.assignments;
    classroomCollection = settings.collections.classrooms;
    userCollection = settings.collections.users;
    journalCollection = settings.collections.journal;
    db = database;
}

var allAssignments = [];
var assignmentData;
var students = [];


//add assignments
exports.addAssignment = function(req, res){
    //validate
    if(!req.body.assignment){
        res.status(400).send({
            error: "Assignment object is not defined",
            code:22
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
    db.collection(assignmentCollection, function(err, collection){
        if(err){
            res.status(500).send({
                error: "Error accessing database",
                code:23
            });
            return;
        }
        collection.findOne({name: assignment.name}, function(err, item){
            if(err){
                res.status(500).send({
                    error: "Error accessing database",
                    code:23
                });
                return;
            }
            if(item){
                res.status(400).send({
                    error: "Assignment with this name already exists",
                    code:24
                });
                return;
            }
            collection.insertOne(assignment, {safe:true}, function(err, result){
                if(err){
                    res.status(500).send({
                        error: "Error accessing database",
                        code:23
                    });
                    return;
                }
                res.send(result.ops[0]);
            }
            );
        });
    }
    );
}

//find All assignments 
exports.findAll = function(req, res){
    //find all assignments 
    db.collection(assignmentCollection, function(err, collection){
        if(err){
            res.send({'error':'An error has occurred in finding assignments'});
        } else {
            collection.find().toArray(function(err, items){
                allAssignments = items;
                res.send(items)
                
            });
        }
    });
}

exports.launchAssignment = function(req, res){
    //validate
    if(!req.params.assingid){
        res.status(400).send({
            error: "Assignment id is not defined",
            code:22
        });
        return;
    }

    //find assignment by id
    db.collection(assignmentCollection, function(err, collection){
        collection.findOne({_id: new mongo.ObjectID(req.params.assingid)}, function(err, assignment){
            if(err){
                res.send({'error':'An error has occurred in finding assignment'});
            } else {
                assignmentData = assignment;
                //find all students from classrooms
                var classrooms = assignmentData.classrooms;
                var privateJournalIds = []; //to store private journal ids of every student
                var students = []; //to store all students data 


                //get students private_journal
                common.fetchAllStudents(classrooms).then(function(stds){
                    //student data
                    students = students.concat(stds);

                    //getting priavte journal ids from every student id
                    var uniqueJournalIds = [];
                    for (var i=0; i < stds.length; i++) {
                        if(uniqueJournalIds.indexOf(stds[i].private_journal.toString()) == -1){
                            uniqueJournalIds.push(stds[i].private_journal.toString());
                        }
                    }

                    privateJournalIds = uniqueJournalIds;
                     var entryDoc= {};

                    db.collection(journalCollection, function(err, collection){
                        if(err){
                            res.send({"error":"An error has occurred in finding journal Entry"});
                        }else{
                            //find entry by private_journal and ObjectID
                            console.log(assignmentData.assignedWork.toString());
                            collection.findOne(
                                {
                                    _id: new mongo.ObjectID(req.user.private_journal)   
                                }
                               
                                , function(err, entry){
                                
                                if(err){
                                    res.send({"error":"An error has occurred in finding journal Entry"});
                                }else{
                                    
                                    for(var i=0; i < entry.content.length; i++){
                                        if(entry.content[i].objectId == assignmentData.assignedWork.toString()){
                                            entryDoc = entry.content[i];
                                        }
                                    }
                                    //adding assignment metadata to entry
                                    entryDoc.metadata.assignmentId = req.params.assingid;
                                    entryDoc.metadata.submissionDate = null;
                                    entryDoc.metadata.isSubmitted = false;
                                    
                                    for(var i=0; i < privateJournalIds.length; i++){
                                        entryDoc = createEntry(entryDoc);
                                        console.log(entryDoc);
                                        updateEntry(entryDoc, privateJournalIds[i]).then(function(result){
                                            //send data to client
                                            res.send({
                                                "result":updatedEntryDoc,
                                                'entry':entryDoc,
                                                });
                                        }).catch(function(err){
                                            res.send({
                                                "error":err
                                            });
                                        });
                                    }
                                   
                                }
                            })
                        }
                    })  
                }).catch(function(err){
                    res.send({'error':err});
                });
                     
            }

        });
    });
}

function createEntry(entryDoc){
    var objectId = common.createUUID();
    if(typeof entryDoc == "object"){
        entryDoc.objectId = objectId;
    }
    return entryDoc;
}

function updateEntry(entryDoc, privateJournalId){
    return new Promise(function(resolve, reject){
        db.collection(journalCollection, function(err, collection){
        collection.updateOne(
            {
                _id: new mongo.ObjectID(privateJournalId)
            },
            {
                $push: {
                    "content": entryDoc
                }

            },
            function(err, result){
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            }
        );

    })
    })

}
//assignments handling 
var mongo = require('mongodb');
var classrooms = require('./classrooms');


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
            collection.insert(assignment, {safe:true}, function(err, result){
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
    //find all assignments with error handling
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
                var private_journal_Ids = []; //to store private journal ids of every student
                var students = []; //to store all students data 


                //get students private_ournal
                fetchAllStudents(classrooms).then(function(stds){
                    //student data
                    students = students.concat(stds);

                    //getting priavte journal ids from every student id
                    var uniqueStudents = [];

                    var map = new Map();
                    for (var i=0; i < stds.length; i++) {
                        if(!map.has(stds[i].private_journal)){
                            map.set(stds[i].private_journal, true); // set any value to Map
                            uniqueStudents.push(stds[i].private_journal.toString());
                        }
                    }

                    private_journal_Ids = uniqueStudents;

                    return new Promise(function(resolve, reject){
                    db.collection(journalCollection, function(err, collection){
                        collection.find({
                                        _id: {
                                            
                                            $in: private_journal_Ids.map(function(id) {
                                                return new mongo.ObjectID(id);
                                            })
                                        
                                        }})
                                            .toArray(function(err, journal){
                                if(err){
                                    reject(err);
                                } else {
                                        resolve(journal); 
                                        addEntry(req, req.user.private_journal).then(function(journalEntry){
                                            console.log({'journal':journalEntry.content[0]});
                                            res.send(journalEntry);
                                            // add journal entry private journal of every students
                                            db.collection(journalCollection, function(err, collection){
                                                collection.updateMany({
                                                    _id: {
                                                        $in: private_journal_Ids.map(function(id) {
                                                            return new mongo.ObjectID(id);
                                                        }
                                                    )
                                                }},
                                                {
                                                    $push:{
                                                        content: journalEntry.content[0]
                                                    }
                                                },
                                                function(err, result){
                                                    if(err){
                                                        console.log(err);
                                                    } else {
                                                        console.log(result);
                                                    }
                                                })
                                            });
                                        });

                                    }
                                });
                            });
                         });
                    }).catch(function(err){
                        console.log(err);
                });
            }
        });
    });
}

//find journal and add entry to it
function addEntry(req,private_journal){
    return new Promise(function(resolve, reject){
        db.collection(journalCollection, function(err, collection){
            collection.findOne({_id: new mongo.ObjectID(private_journal)}, function(err, journalEntry){
                if(err){
                    reject(err);
                } else {
                    console.log({'journalEntry':journalEntry});
                    if(journalEntry.content.length > 0){
                       journalEntry.content[0].metadata = {
                            ...journalEntry.content[0].metadata,
                            assignment_id: req.params.assingid,
                            submission_date: new Date(),
                            isSubmitted: false
                            
                        }
                        
                    }
                    resolve(journalEntry);
                }
            });
        });
    });
}





function fetchAllStudents(classrm) {
	return new Promise(function(resolve) {
		var students = [];
		if (classrm.length == 0) return resolve(students);
		for (var classCount=0, i=0; i < classrm.length; i++) {
			classrooms.findStudents(classrm[i]).then(function(stds) {
				students = students.concat(stds);
				classCount++;
				if (classCount == classrm.length) return resolve(students);
			}).catch(function() {
				classCount++;
				if (classCount == classrm.length) return resolve(students);
			});
		}
	});
}




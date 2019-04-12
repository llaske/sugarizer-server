// Script to import users from csv

// Read the name of the file
var filename = process.argv.slice(2)[0];
if (filename) {
    console.log("File: " + filename);
} else {
    console.log('Filename not specified');
    process.exit(-1);
}

// Import csv-parser module
var csv = require('csv-parser');

// Import fs module
var fs = require('fs');

// Import request library to make requests over the network
var request = require('request');

// Import common helper
var common = require('../dashboard/helper/common');

// Set the node enviornment to test
process.env.NODE_ENV = 'test';

// Define user with parameterized constructor
class User {
    constructor(name, type, language, color, password, classroom) {
        this.name = name;
        this.type = type;
        this.language = language;
        this.color = color;
        this.password = password;
        if (classroom)
            this.classroom = classroom;
        this.status = 0;
        this.comment = "";
        this._id = "";
    }
}

// Initialize the array that will contains all the users read from CSV
var Users = [];

// Trim and lowercase string
function cleanString(string) {
    if (!string) return;
    string = string.trim();
    string = string.toLowerCase();
    return string;
}

// Validate color string
function isValidColor(color) {
    try {
        color = JSON.parse(color);
    } catch (e) {
        return false;
    }
    if (!color.stroke || !color.fill) return false;
    return true
}

// Generate random password
function generatePassword(length) {
    var password = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < length; i++)
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return password;
}

// Validate data row
function validateUserRow(user, index) {
    if (!user.name) {
        console.log("Row: " + (index + 1) + " -> Username is invalid\nSkipping...");
        return;
    }

    user.type = cleanString(user.type);
    if (!user.type) {
        user.type = "student";
    }

    // ToDo: Validate language from an array of valid languages
    user.language = cleanString(user.language);
    if (!user.language) {
        user.language = "en";
    }

    user.color = cleanString(user.color);
    if (!isValidColor(user.color)) {
        // ToDo: Randomize Color
        user.color = '{ "stroke":"#ff0000", "fill":"#0000ff" }';
    }

    // ToDo: Get minimum password length from .ini file
    if (!user.password || typeof user.password != "string" || user.password.length < 4) {
        console.log("Row: " + (index + 1) + " -> User: " + user.name + " -- Password is invalid\nGenerating random password...");
        user.password = generatePassword(8);
    }

    user.classroom = user.classroom || "";
    user.classroom = user.classroom.trim();

    return user;
}

function stringifyUser(user) {
    return '{"name":"' + user.name + '", ' + 
            '"color":' + user.color + ', ' +
            '"role":"' + user.type + '", ' +
            '"password":"' + user.password + '", ' + 
            '"language":"' + user.language + '", ' +
            '"options":{"sync":true, "stats":true}}';
}

// Initiate Master Admin
var masterAdmin = stringifyUser(new User('Master_Admin_' + (+new Date()).toString(), 'admin', 'en', '{"stroke":"#ff0000", "fill":"#0000ff"}', 'password'));

// Insert User
function insertUser(i) {
    return new Promise(function(resolve, reject) {
        request({
            headers: {
                "content-type": "application/json",
                "x-access-token": masterAdmin.token,
                "x-key": masterAdmin.user._id
            },
            json: true,
            method: 'post',
            uri: common.getAPIUrl() + 'api/v1/users',
            body: {
                user: stringifyUser(Users[i])
            }
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                Users[i].status = 1;
                Users[i]._id = body._id;
                resolve(body);
            } else {
                Users[i].comment = body.error;
                reject(body);
            }
        });
    });
}

function generateCSV() {
    console.log("generating csv...");
}

// Initiate Classrooms
var Classrooms = {}; // Contains {classname: [students_array]}

function stringifyClassroom(name) {
    var newStudents = Classrooms[name].students;
    var oldStudents = [];
    if (Classrooms[name].data && Classrooms[name].data.students && Classrooms[name].data.students.length > 0) {
        oldStudents = Classrooms[name].data.students 
    }
    var union = [...new Set([...newStudents, ...oldStudents])];
    var students = JSON.stringify(union);
    console.log(union);
    return '{"name":"' + name + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":' + students + '}';
}

// Update classroom by ID
function updateClassroom(name) {
    return new Promise(function(resolve, reject) {
        request({
            headers: {
                "content-type": "application/json",
                "x-access-token": masterAdmin.token,
                "x-key": masterAdmin.user._id
            },
            json: true,
            method: 'put',
            uri: common.getAPIUrl() + 'api/v1/classrooms/' + Classrooms[name].data._id,
            body: {
                classroom: stringifyClassroom(name)
            }
        }, function(error, response, body) {
            body.q = name;
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

// Insert Classroom
function insertClassroom(name) {
    return new Promise(function(resolve, reject) {
        request({
            headers: {
                "content-type": "application/json",
                "x-access-token": masterAdmin.token,
                "x-key": masterAdmin.user._id
            },
            json: true,
            method: 'post',
            uri: common.getAPIUrl() + 'api/v1/classrooms',
            body: {
                classroom: stringifyClassroom(name)
            }
        }, function(error, response, body) {
            body.q = name;
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

// Find Classroom
function findClassroom(name) {
    return new Promise(function(resolve, reject) {
        var query = {
            sort: '+name',
            q: name
        };
        request({
            headers: {
                "content-type": "application/json",
                "x-access-token": masterAdmin.token,
                "x-key": masterAdmin.user._id
            },
            json: true,
            method: 'GET',
            qs: query,
            uri: common.getAPIUrl() + 'api/v1/classrooms'
        }, function(error, response, body) {
            body.q = name;
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

// Create a list of all classrooms in Users
function getClassroomsNamesFromUsers() {
    var classroomList = [];
    for(var i=0; i<Users.length; i++) {
        if (Users[i].classroom && classroomList.indexOf(Users[i].classroom) == -1) classroomList.push(Users[i].classroom);
    }
    return classroomList;
}

// Find classrooms. Insert classroom if not found
function findOrCreateClassroom(classes) {
    var classroomProcessed = 0;
    for (var i=0; i < classes.length; i++) {
        findClassroom(classes[i]).then(function(res) {
            if (res && res.classrooms && res.classrooms.length > 0 && res.classrooms[0] && res.q == res.classrooms[0].name) {
                // Confirm Match
                Classrooms[res.q].data = res.classrooms[0];
                updateClassroom(res.q).then(function(res) {
                    classroomProcessed++;
                    if (res) {
                        Classrooms[res.q].data = res;
                    } else {
                        console.log("error creating classroom");
                    }
                    if (classroomProcessed == classes.length) generateCSV();
                })
                .catch(function(err) {
                    classroomProcessed++;
                    console.log(err);
                    if (classroomProcessed == classes.length) generateCSV();
                })
            } else {
                // Create Classroom
                insertClassroom(res.q).then(function(res) {
                    classroomProcessed++;
                    if (res) {
                        Classrooms[res.q].data = res;
                    } else {
                        console.log("error creating classroom");
                    }
                    if (classroomProcessed == classes.length) generateCSV();
                })
                .catch(function(err) {
                    classroomProcessed++;
                    console.log(err);
                    if (classroomProcessed == classes.length) generateCSV();
                })
            }
        })
        .catch(function(err) {
            classroomProcessed++;
            console.log(err);
            if (classroomProcessed == classes.length) generateCSV();
        });
    }
}

// Processed users for assignment into classrooms
function initClassroomAssignment() {
    console.log('Initiating classroom assignment...');
    var uniqueClassrooms = getClassroomsNamesFromUsers();
    for (var i=0; i<uniqueClassrooms.length; i++) {
        Classrooms[uniqueClassrooms[i]] = {data: "", students: []};
    }
    for (var j=0; j<Users.length; j++) {
        if (Users[j].status && Users[j].type == "student" && Users[j]._id && Users[j].classroom && Classrooms[Users[j].classroom] && typeof Classrooms[Users[j].classroom].students == "object") {
            // Push user into classroom
            Classrooms[Users[j].classroom].students.push(Users[j]._id);
        }
    }

    findOrCreateClassroom(uniqueClassrooms);
}

// Initiate Server
function initServer() {
    // Import sugarizer server
    require('../sugarizer');
}

// Initiate seeding to DB
function initSeed() {
    // Create Temporary Admin
    console.log('Creating Temporary Admin...');

    request({
        headers: {
            "content-type": "application/json",
        },
        json: true,
        method: 'POST',
        uri: common.getAPIUrl() + 'auth/signup',
        body: {
            "user" : masterAdmin
        }
    }, function(error, response) {
        if (response.statusCode == 200) {
            console.log('Temporary Admin created');
            request({
                headers: {
                    "content-type": "application/json",
                },
                json: true,
                method: 'POST',
                uri: common.getAPIUrl() + 'auth/login',
                body: {
                    "user" : masterAdmin
                }
            }, function(error, response, body) {
                if (response.statusCode == 200) {
                    masterAdmin = body;

                    console.log('Logged into Temporary Admin');

                    console.log('Inserting users...');
                    var usersProcessed = 0;
                    // Insert all users
                    for (var i=0; i < Users.length; i++) {
                        insertUser(i).then(function() {
                            usersProcessed++;
                            if (usersProcessed == Users.length) initClassroomAssignment();
                        }).catch(function(err) {
                            usersProcessed++;
                            console.log(err);
                            if (usersProcessed == Users.length) initClassroomAssignment();
                        });
                    }
                } else {
                    console.log('Error logging into Temporary Admin');
                    process.exit(-1);
                }
            });
        } else {
            console.log('Error creating Temporary Admin');
            process.exit(-1);
        }
    });
}


console.log("Reading and validating file");
var dataIndex = 0;
// Read the CSV file
fs.createReadStream(filename)
    .on('error', function(err) {
        console.log(err);
        // ToDo: Check safely terminate script
        throw err;
    })
    .pipe(csv())
    .on('data', function(row) {
        dataIndex++;
        var validRow = validateUserRow(row, dataIndex);
        if (validRow) Users.push(new User(validRow.name, validRow.type, validRow.language, validRow.color, validRow.password, validRow.classroom));
    })
    .on('end', function() {
        console.log('Finished processing CSV file');
        console.log(Users);
        console.log('Starting Sugarizer-Server...');
        initServer();
        setTimeout(initSeed, 1000);
    });

// Bug: Issue while inserting users with same name;

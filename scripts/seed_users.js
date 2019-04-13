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

// Import csv-writer module and create CSV writer
var csvWriter = require('csv-writer')
var createCsvWriter = csvWriter.createObjectCsvWriter; 

// Import fs module
var fs = require('fs');

// Import ini module to parse '.ini' files
var ini = require('ini')

// Import request library to make requests over the network
var request = require('request');

// Import common helper
var common = require('../dashboard/helper/common');

// Import xocolors helper
var xocolors = require('../dashboard/helper/xocolors')();

// Initialize settings for sugarizer.ini
var settings;

// Read settings from sugarizer.ini file
var confFile = './env/sugarizer.ini';
fs.open(confFile, 'r', function(err, fd) {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log("Cannot load settings file 'sugarizer.ini', error code "+err.code);
        process.exit(-1);
      }
    }

    // Assign configuration data to settings
    settings = ini.parse(fs.readFileSync(confFile, 'utf-8'));

    // Initialize common module with settings
    common.init(settings);
});

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

// Get random color from xocolors and generate color string
function getRandomColorString() {
    var randomColor = xocolors[Math.floor(Math.random()*xocolors.length)];
    randomColor = JSON.stringify(randomColor);
    return randomColor;
}

// Validate color string
function isValidColor(color) {
    // Check if valid JSON
    try {
        color = JSON.parse(color);
    } catch (e) {
        return false;
    }

    // Check if property 'stroke' and 'fill' exists
    if (!color.stroke || !color.fill) return false;

    // Look for the color in xocolors
    for (var i=0; i<xocolors.length; i++) {
        if (xocolors[i].stroke == color.stroke && xocolors[i].fill == color.fill) {
            return true;
        }
    }
    return false
}

// Validate language
function isValidLanguage(lang) {
    var sugarizerLang = ["en", "es", "fr", "de", "pt", "ar", "ja", "pl", "ibo", "yor"];
    if(sugarizerLang.indexOf(lang) == -1) return false;
    else return true;
}

// Generate random password
function generatePassword(length) {
    var password = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXabcdefghijklmnopqrstuvwxyz0123456789"; // All alphanumeric characters except 'Y' and 'Z' 
    
    for (var i = 0; i < length; i++)
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return password;
}

// Validate data row
function validateUserRow(user, index) {
    if (!user.name) {
        console.log("Row: " + (index + 1) + " -> Username is invalid. Skipping...");
        return;
    }

    user.type = cleanString(user.type);
    if (!user.type) {
        user.type = "student";
    }

    user.language = cleanString(user.language);
    if (!isValidLanguage(user.language)) {
        user.language = "en";
    }

    if (!isValidColor(user.color)) {
        user.color = getRandomColorString();
    }

    var minPass = (settings && settings.security && parseInt(settings.security.min_password_size)) ? parseInt(settings.security.min_password_size) : 4;
    if (!user.password || typeof user.password != "string" || user.password.length < minPass) {
        console.log("Row: " + (index + 1) + " -> User: " + user.name + " -- Password is invalid. Generating random password...");
        user.password = generatePassword(minPass);
    }

    user.classroom = user.classroom || "";
    user.classroom = user.classroom.trim();

    return user;
}

// Function to stringift user class object
function stringifyUser(user) {
    return '{"name":"' + user.name + '", ' + 
            '"color":' + user.color + ', ' +
            '"role":"' + user.type + '", ' +
            '"password":"' + user.password + '", ' + 
            '"language":"' + user.language + '", ' +
            '"options":{"sync":true, "stats":true}}';
}

// Initiate Master Admin
var masterAdmin = stringifyUser(new User('Master_Admin_' + (+new Date()).toString(), 'admin', 'en', getRandomColorString(), 'password'));

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

// Initiate Classrooms object
var Classrooms = {}; // Contains {classname{ students: [students_array], data: classroom_data }

function stringifyExistingClassroom(name) {
    var newStudents = Classrooms[name].students;
    var oldStudents = [];
    if (Classrooms[name].data && Classrooms[name].data.students && Classrooms[name].data.students.length > 0) {
        oldStudents = Classrooms[name].data.students 
    }
    var union = [...new Set([...newStudents, ...oldStudents])];
    var classroomData = {
        name: name,
        color: Classrooms[name].data.color,
        students: union
    }
    classroomData = JSON.stringify(classroomData);
    return classroomData;
}

function stringifyNewClassroom(name) {
    var students = JSON.stringify(Classrooms[name].students);
    return '{"name":"' + name + '","color":' + getRandomColorString() + ',"students":' + students + '}';
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
                classroom: stringifyExistingClassroom(name)
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
                classroom: stringifyNewClassroom(name)
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

// Function to generate CSV of users
function generateCSV() {
    return new Promise(function(resolve, reject) {
        var csvWriter = createCsvWriter({
            path: filename + "_output.csv",
            header: [
                {id: 'name', title: 'name'}, 
                {id: 'type', title: 'type'}, 
                {id: 'language', title: 'language'}, 
                {id: 'color', title: 'color'}, 
                {id: 'password', title: 'password'}, 
                {id: 'classroom', title: 'classroom'}, 
                {id: 'status', title: 'status'}, 
                {id: 'comment', title: 'comment'}
            ]
        });
        csvWriter
        .writeRecords(Users)
        .then(function() {
            resolve(filename + "_output.csv");
        }).catch(function(err) {
            reject(err);
        });
    });
}

// Function to delete Master Admin
function deleteMasterAdmin() {
    return new Promise(function(resolve, reject) {
        request({
            headers: {
                "content-type": "application/json",
                "x-access-token": masterAdmin.token,
                "x-key": masterAdmin.user._id
            },
            json: true,
            method: 'delete',
            uri: common.getAPIUrl() + 'api/v1/users/' + masterAdmin.user._id,
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

// Finish classroom assignment and generate CSV and delete Master Admin 
function finishClassroomAssignment() {
    Promise.all([generateCSV(), deleteMasterAdmin()]).then(function(values) {
        console.log('The CSV file written successfully. Filename: ' + values[0]);
        process.exit(0);
    }).catch(function(err) {
        console.log(err);
    });
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
                        console.log("Error creating classroom");
                    }
                    if (classroomProcessed == classes.length) finishClassroomAssignment();
                })
                .catch(function(err) {
                    classroomProcessed++;
                    console.log(err);
                    if (classroomProcessed == classes.length) finishClassroomAssignment();
                })
            } else {
                // Create Classroom
                insertClassroom(res.q).then(function(res) {
                    classroomProcessed++;
                    if (res) {
                        Classrooms[res.q].data = res;
                    } else {
                        console.log("Error creating classroom");
                    }
                    if (classroomProcessed == classes.length) finishClassroomAssignment();
                })
                .catch(function(err) {
                    classroomProcessed++;
                    console.log(err);
                    if (classroomProcessed == classes.length) finishClassroomAssignment();
                })
            }
        })
        .catch(function(err) {
            classroomProcessed++;
            console.log(err);
            if (classroomProcessed == classes.length) finishClassroomAssignment();
        });
    }
}

// Processed users for assignment into classrooms
function initClassroomAssignment() {
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

    if (uniqueClassrooms.length > 0) findOrCreateClassroom(uniqueClassrooms);
    else finishClassroomAssignment();
}

// Initiate seeding to DB
function initSeed() {
    // Create Master Admin
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
        if (response && response.statusCode == 200) {
            // Master Admin created
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
                    // Logged into Master Admin
                    masterAdmin = body;

                    var usersProcessed = 0;
                    // Insert all users
                    for (var i=0; i < Users.length; i++) {
                        insertUser(i).then(function() {
                            usersProcessed++;
                            if (usersProcessed == Users.length) initClassroomAssignment();
                        }).catch(function(err) {
                            console.log(err);
                            usersProcessed++;
                            if (usersProcessed == Users.length) initClassroomAssignment();
                        });
                    }
                } else {
                    console.log('Error logging into Master Admin');
                    process.exit(-1);
                }
            });
        } else if (!response) {
            console.log('Error: Cannot access sugarizer-server');
            process.exit(-1);
        } else {
            console.log('Error creating Master Admin');
            process.exit(-1);
        }
    });
}

// Reading and validating file

var dataIndex = 0;
// Read the CSV file
fs.createReadStream(filename)
    .on('error', function(err) {
        throw err;
    })
    .pipe(csv())
    .on('data', function(row) {
        dataIndex++;
        var validRow = validateUserRow(row, dataIndex);
        if (validRow) Users.push(new User(validRow.name, validRow.type, validRow.language, validRow.color, validRow.password, validRow.classroom));
    })
    .on('end', function() {
        // Finished processing CSV file
        if (Users.length == 0) {
            console.log('Error: No users to insert');
            process.exit(-1);
        }
        initSeed();
    });

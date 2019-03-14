// Import request library to make requests over the network
var request = require('request');

// Import common helper
var common = require('./dashboard/helper/common');

// Set the node enviornment to test
process.env.NODE_ENV = 'test';

// Import sugarizer server
require('./sugarizer');

var timestamp = +new Date();

var userIndex = -1;

function newStudent() {
	userIndex++;
	return '{"name":"Sugarizer' + userIndex + '_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"password","language":"en","options":{"sync":true,"stats":true}}';
}

function newAdmin() {
	userIndex++;
	return '{"name":"Sugarizer' + userIndex + '_' + (timestamp.toString()) + '","password":"password","role":"admin"}';
}

// Initiate Master Admin
var masterAdmin = newAdmin();

// Initiate Students Array
var createdStudents = [];

// Initiate Admins Array
var createdAdmins = [];

function createStudent() {
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
                user: newStudent()
            }
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                createdStudents.push(body);
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

function createAdmin() {
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
                user: newAdmin()
            }
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                createdAdmins.push(body);
                resolve(body);
            } else {
                reject(body);
            }
        });
    });
}

var classroomIndex = 0;

function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function newClassroom() {
    var randomLength = Math.round(Math.random()*createdStudents.length);
    var students = getRandomArrayElements(createdStudents, randomLength);
    students = JSON.stringify(students.map(function(student) { return student._id; }));
	classroomIndex++;
	return '{"name":"group_' + classroomIndex + '_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":' + students + '}';
}


var createdClassrooms = [];

function createClassroom() {
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
                classroom: newClassroom()
            }
        }, function(error, response, body) {
            if (response.statusCode == 200) {
                createdClassrooms.push(body);
                resolve(body);
            } else {
                console.log(body);
                reject(body);
            }
        });
    });
}

// Create fake users
console.log('Creating fake Master Admin...');

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
        console.log('Master admin created');
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
                console.log('Master admin username: ' + masterAdmin.user.name);
                console.log('Master admin password: ' + masterAdmin.user.password);

                console.log('Logged into Master Admin');

                console.log('Creating fake users...');

                var count = 5;
                for (var i=0; i < count; i++) {
                    createStudent().then(function() {
                        // console.log('Student created');

                        // ToDo: Create Journal here

                        if (createdStudents.length == count) {
                            console.log(count + ' Students Created');
                            // Create Classrooms
                            console.log("Creating classrooms...");
                            for (var j=0; j<count; j++) {
                                createClassroom().then(function() {
                                    if (createdClassrooms.length == count) {
                                        console.log(count + ' Classrooms created');
                                        console.log('Finished seeding DB. Exiting...');
                                        process.exit(0);
                                    }
                                }).catch(function() {
                                    console.log('Error creating classroom');
                                    process.exit(-1);
                                });
                            }
                        }
                    }).catch(function() {
                        console.log('Failed to create student');
                        process.exit(-1);
                    });

                    createAdmin().then(function() {
                        // console.log('Admin created');
                        if (createdAdmins.length == count) {
                            console.log(count + ' Admins created');
                        }
                    }).catch(function() {
                        console.log('Failed to create admin');
                        process.exit(-1);
                    });
                }
            } else {
                console.log('Error logging into Master Admin');
                process.exit(-1);
            }
        });
    } else {
        console.log('Error creating Master Admin');
        process.exit(-1);
    }
});


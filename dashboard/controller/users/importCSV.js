// include libraries
var request = require('request'),
	moment = require('moment'),
	csv = require('csv-parser'),
	fs = require('fs'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	regexValidate = require('../../helper/regexValidate');

var users = require('./index');

// Define user with parameterized constructor
class User {
	constructor(name, type, language, color, password, classroom, comment) {
		this.status = 0;
		this.comment = comment ? comment : "";
		this._id = "";
		this.name = name;
		this.type = type;
		this.language = language;
		this.color = color;
		this.password = password;
		if (classroom)
			this.classroom = classroom;
	}
}

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
	return false;
}

// Validate language
function isValidLanguage(lang) {
	var sugarizerLang = ["en", "es", "fr", "de", "pt", "ar", "ja", "pl", "ibo", "yor"];
	if(sugarizerLang.indexOf(lang) == -1) return false;
	else return true;
}

// Validate user role
function isValidType(type) {
	var roles = ["admin", "student"];
	if (roles.indexOf(type) == -1) return false;
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
function validateUserRow(user) {
	user.comment = "";

	if (!user.name || !regexValidate("user").test(user.name)) {
		return;
	}

	user.type = cleanString(user.type);
	if (!isValidType(user.type)) {
		user.type = "student";
	}

	user.language = cleanString(user.language);
	if (!isValidLanguage(user.language)) {
		user.language = "en";
	}

	if (!isValidColor(user.color)) {
		user.color = getRandomColorString();
	}

	var minPass = (users.ini() && users.ini().security && parseInt(users.ini().security.min_password_size)) ? parseInt(users.ini().security.min_password_size) : 4;
	if (!user.password || typeof user.password != "string" || user.password.length < minPass || !regexValidate("pass").test(user.password)) {
		user.password = generatePassword(minPass);
		user.comment += "Given password was invalid (Generated random password). ";
	}

	user.classroom = user.classroom ? user.classroom.trim() : "";
	if (user.classroom && (typeof user.classroom != "string" || !regexValidate("user").test(user.classroom))) {
		user.classroom = "";
		user.comment += "Given classroom name was invalid (Classroom dropped). ";
	}

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

module.exports = function profile(req, res) {

	// Initialize the array that will contains all the users read from CSV
	var Users = [];
	var InvalidUsers = [];

	// Insert User
	function insertUser(i) {
		return new Promise(function(resolve, reject) {
			request({
				headers: common.getHeaders(req),
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
					Users[i].comment += body.error;
					body.user = Users[i];
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
			oldStudents = Classrooms[name].data.students;
		}
		var union = [...new Set([...newStudents, ...oldStudents])];
		var classroomData = {
			name: name,
			color: Classrooms[name].data.color,
			students: union
		};
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
				headers: common.getHeaders(req),
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
				headers: common.getHeaders(req),
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
				headers: common.getHeaders(req),
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
							console.log("Error creating classroom");
						}
						if (classroomProcessed == classes.length) finishClassroomAssignment();
					})
						.catch(function(err) {
							classroomProcessed++;
							console.log(err);
							if (classroomProcessed == classes.length) finishClassroomAssignment();
						});
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
						});
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
	function initSeed(Users) {
		var usersProcessed = 0;
		// Insert all users
		for (var i=0; i < Users.length; i++) {
			insertUser(i).then(function() {
				usersProcessed++;
				if (usersProcessed == Users.length) initClassroomAssignment();
			}).catch(function() {
				usersProcessed++;
				if (usersProcessed == Users.length) initClassroomAssignment();
			});
		}
	}

	// // Function to generate CSV of users
	// function generateCSV() {
	// 	return new Promise(function(resolve, reject) {
	// 		var csvWriter = createCsvWriter({
	// 			path: "output.csv",
	// 			header: [
	// 				{id: 'name', title: 'name'},
	// 				{id: 'type', title: 'type'},
	// 				{id: 'language', title: 'language'},
	// 				{id: 'color', title: 'color'},
	// 				{id: 'password', title: 'password'},
	// 				{id: 'classroom', title: 'classroom'},
	// 				{id: 'status', title: 'status'},
	// 				{id: 'comment', title: 'comment'}
	// 			]
	// 		});
	// 		csvWriter
	// 			.writeRecords(Users)
	// 			.then(function() {
	// 				resolve("output.csv");
	// 			}).catch(function(err) {
	// 				reject(err);
	// 			});
	// 	});
	// }

	// Finish classroom assignment and generate CSV and delete Master Admin
	function finishClassroomAssignment() {
		// generateCSV()
		// 	.then(function(filename) {
		// 		console.log('The CSV file written successfully. Filename: ' + filename);
		// 		process.exit(0);
		// 	}).catch(function(err) {
		// 		console.log(err);
		// 	});
		var allUsers = [...new Set([...Users, ...InvalidUsers])];
		res.json({success: true, msg: "Successfully inseterd users", data: allUsers});
	}

	// Reading and validating file
	fs.createReadStream(req.file.path)
		.on('error', function(err) {
			throw err;
		})
		.pipe(csv())
		.on('data', function(row) {
			var validRow = validateUserRow(row);
			if (validRow) {
				Users.push(new User(validRow.name, validRow.type, validRow.language, validRow.color, validRow.password, validRow.classroom, validRow.comment));
			} else {
				InvalidUsers.push(new User(row.name, row.type, row.language, row.color, row.password, row.classroom, "Invalid Username"));
			}
		})
		.on('end', function() {
			// Finished processing CSV file
			if (Users.length == 0) {
				fs.unlinkSync(req.file.path); // remove temp file
				return res.json({success: false, msg: "Error: No users to insert"});
			}
			initSeed(Users);
			fs.unlinkSync(req.file.path); // remove temp file
		});
};

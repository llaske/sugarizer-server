// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportCSV(req, res) {
	var users = [];
	var Classrooms = {};

	common.reinitLocale(req);
	var selectedUsername = req.params.username;
	var selectedRole = req.params.role;
	var selectedClassroom = req.params.classroom; 

	function validateUser(user) {
		var validUser = {
			_id: "",
			name: "",
			type: "",
			language: "",
			stroke: "",
			fill: "",
			password: "",
			classroom: ""
		};
		if (user._id) {
			validUser._id = user._id;
		}
		if (user.name) {
			validUser.name = user.name;
		}
		if (user.role) {
			validUser.type = user.role;
		}
		if (user.language) {
			validUser.language = user.language;
		}
		if (user.color && typeof user.color == "object") {
			if (user.color && user.color.stroke && user.color.fill) {
				validUser.stroke = user.color.stroke;
				validUser.fill = user.color.fill;
			}
		}
		if (user.password) {
			validUser.password = user.password;
		}
		if (user.role == "teacher") {
			if (user.classrooms && typeof user.classrooms == "object") {
				for (var i=0; i < user.classrooms.length; i++) {
					if (user.classrooms[i] && Classrooms[user.classrooms[i]]) {
						validUser.classroom += Classrooms[user.classrooms[i]].name;
						validUser.classroom += ", "; 
					}
				}
			}
		} else if (user.role == "student") {
			for (var _id in Classrooms) {
				if (user._id && Classrooms[_id] && typeof Classrooms[_id].students == "object" && Classrooms[_id].students.includes(user._id)) {
					validUser.classroom += Classrooms[_id].name;
					validUser.classroom += ", ";
				}
			}
		}
		if (validUser.classroom.length) validUser.classroom = validUser.classroom.substring(0, validUser.classroom.length - 2);
		
		return validUser;
	}

    
	async.series([
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/classrooms')
				.set(common.getHeaders(req))
				.query({
					limit: 100000000
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body && typeof response.body.classrooms == "object" && response.body.classrooms.length > 0) {
							for (var i=0; i<response.body.classrooms.length; i++) {
								Classrooms[response.body.classrooms[i]._id] = {
									name: response.body.classrooms[i].name,
									students: response.body.classrooms[i].students
								};
								if (i == response.body.classrooms.length - 1) callback(null);
							}
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				});
		},
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/users')
				.set(common.getHeaders(req))
				.query({
					sort: '-timestamp',
					role: 'admin',
					limit: 100000000
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body.users && response.body.users.length) {
							var admins = [];
							for (var i=0; i < response.body.users.length; i++) {
								admins.push(validateUser(response.body.users[i]));
								if (i == response.body.users.length - 1) {
									users = users.concat(admins);
									callback(null);
								}
							}
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				});
		},
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/users')
				.set(common.getHeaders(req))
				.query({
					sort: '-timestamp',
					role: 'student',
					limit: 100000000
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body.users  && response.body.users.length) {
							var students = [];
							for (var i=0; i < response.body.users.length; i++) {
								students.push(validateUser(response.body.users[i]));
								if (i == response.body.users.length - 1) {
									users = users.concat(students);
									callback(null);
								}
							}
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				});
		},
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/users')
				.set(common.getHeaders(req))
				.query({
					sort: '-timestamp',
					role: 'teacher',
					limit: 100000000
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body.users && response.body.users.length) {
							var teachers = [];
							for (var i=0; i < response.body.users.length; i++) {
								teachers.push(validateUser(response.body.users[i]));
								if (i == response.body.users.length - 1) {
									users = users.concat(teachers);
									callback(null);
								}
							}
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				});
		}
	], function() {
		var filteredUsers = users.filter(function (user) {
			var isRequired = true;
			if (selectedUsername !== 'undefined' && user.name !== selectedUsername) {
				isRequired = false;
			}
			if (isRequired && selectedRole !== 'all' && user.type !== selectedRole) {
				isRequired = false;
			}
			if (isRequired && selectedRole === 'student' && selectedClassroom !== 'undefined' && selectedClassroom.split(',').indexOf(user._id) === -1) {
				isRequired = false;
			}
			return isRequired;
		});
		if (filteredUsers.length === 0) {
			res.json({ success: false, msg: common.l10n.get('NoUsersFound') });
		} else {
			res.json({ success: true, msg: common.l10n.get('ExportSuccess'), data: filteredUsers });
		}
		return;		  
	});
};

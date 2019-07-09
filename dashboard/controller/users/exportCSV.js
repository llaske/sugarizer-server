// include libraries
var request = require('request'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportCSV(req, res) {
	var users = [];
	var Classrooms = {};

	function validateUser(user) {
		var validUser = {
			_id: "",
			name: "",
			type: "",
			language: "",
			color: "",
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
			validUser.color = JSON.stringify(user.color);
		}
		if (user.password) {
			validUser.password = user.password;
		}
		if (user.classrooms && typeof user.classrooms == "object") {
			for (var i=0; i < user.classrooms.length; i++) {
				if (user.classrooms[i] && Classrooms[user.classrooms[i]]) {
					validUser.classroom += Classrooms[user.classrooms[i]];
					validUser.classroom += ", "; 
				}
			}
			if (validUser.classroom.length) validUser.classroom = validUser.classroom.substring(0, validUser.classroom.length - 2);
		}
		return validUser;
	}

    
	async.series([
		function(callback) {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'GET',
				qs: {
					limit: 100000000
				},
				uri: common.getAPIUrl(req) + 'api/v1/classrooms'
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					if (body && typeof body.classrooms == "object" && body.classrooms.length > 0) {
						for (var i=0; i<body.classrooms.length; i++) {
							Classrooms[body.classrooms[i]._id] = body.classrooms[i].name;
							if (i == body.classrooms.length - 1) callback(null);
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
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'GET',
				qs: {
					sort: '-timestamp',
					role: 'admin',
					limit: 100000000
				},
				uri: common.getAPIUrl(req) + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					if (body.users && body.users.length) {
						var admins = [];
						for (var i=0; i < body.users.length; i++) {
							admins.push(validateUser(body.users[i]));
							if ( i == body.users.length - 1) {
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
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'GET',
				qs: {
					sort: '-timestamp',
					role: 'student',
					limit: 100000000
				},
				uri: common.getAPIUrl(req) + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					if (body.users  && body.users.length) {
						var students = [];
						for (var i=0; i < body.users.length; i++) {
							students.push(validateUser(body.users[i]));
							if ( i == body.users.length - 1) {
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
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'GET',
				qs: {
					sort: '-timestamp',
					role: 'teacher',
					limit: 100000000
				},
				uri: common.getAPIUrl(req) + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					if (body.users && body.users.length) {
						var teachers = [];
						for (var i=0; i < body.users.length; i++) {
							teachers.push(validateUser(body.users[i]));
							if ( i == body.users.length - 1) {
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
		if (users.length == 0) {
			res.json({success: false, msg: common.l10n.get('NoUsersFound')});
		} else {
			res.json({success: true, msg: common.l10n.get('ExportSuccess'), data: users});
		}
		return;
	});
};

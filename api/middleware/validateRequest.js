var jwt = require('jwt-simple');
var users = require('../controller/auth');
var classrooms = require('../controller/classrooms');
var config = require('../../config/secret.js')();

module.exports = function(req, res, next) {

	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key']; //key is unique _id of the user

	if (token && key) {

		try {
			var decoded = jwt.decode(token, config);

			if (decoded.exp <= Date.now()) {
				return res.status(400).send({
					'error': "Token Expired",
					'code': 3
				});
			}

			// Authorize the user to see if s/he can access our resources
			// The key would be the logged in user's id
			users.validateUser(key, function(user) {
				if (user) {

					//store the user object in req
					req.user = user;
					if (user.role == "teacher" && typeof user.classrooms == "object") {
						fetchAllStudents(user.classrooms).then(function(students) {
							var uniqueStudents = [];
							var map = new Map();
							for (var i=0; i < students.length; i++) {
								if(!map.has(students[i]._id)){
									map.set(students[i]._id, true); // set any value to Map
									uniqueStudents.push(students[i]);
								}
							}

							req.user.students = uniqueStudents;
							//update user timestamp
							users.updateTimestamp(key, function(err) {
								if (err) {
									return res.status(500).send({
										'error': 'An error has occurred while updating timestamp',
										'code': 24
									});
								}

								//send to the next middleware
								next();
							});
						});
					} else {
						//update user timestamp
						users.updateTimestamp(key, function(err) {
							if (err) {
								return res.status(500).send({
									'error': 'An error has occurred while updating timestamp',
									'code': 24
								});
							}

							//send to the next middleware
							next();
						});
					}

				} else {
					// No user with this name exists, respond back with a 401
					return res.status(401).send({
						'error': "Invalid User",
						'code': 4
					});
				}
			});

		} catch (err) {
			return res.status(500).send({
				'error': err,
				'code': 5
			});
		}
	} else {
		return res.status(401).send({
			'error': "Invalid Token or Key",
			'code': 6
		});
	}
};

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

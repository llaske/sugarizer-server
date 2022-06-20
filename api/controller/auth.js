var jwt = require('jwt-simple'),
	users = require('./users.js'),
	mongo = require('mongodb'),
	otplib = require('otplib'),
	common = require('../../dashboard/helper/common');

var security;
var secret;

// Init settings
exports.init = function(settings) {
	security = settings.security;
	secret = settings.security.secret;
};

/**
 * @api {post} auth/login/ Login User
 * @apiName Login User
 * @apiDescription login a user (Admin or Student) on to the system. Return the user created with access token.
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} token Unique token of the user
 * @apiSuccess {String} expires Expiration time of token
 * @apiSuccess {Object} user User object (student or admin)
 *
 * @apiSuccessExample {json} Success-Response(Student):
 *     HTTP/1.1 200 OK
 *     {
 *      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTkxNDM2ODQxNjJ9.4gVrk0o_pyYt_X5z-FfdSEFuGGFxeEsQP8QBjNqI9EA",
 *      "expires": 1499143684162,
 *      "user": {
 *       "name": "Tarun",
 *       "role": "student",
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [],
 *       "language": "en",
 *       "password": "xxx",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *     }
 *    }
 *
 * @apiSuccessExample {json} Success-Response(Admin):
 *     HTTP/1.1 200 OK
 *     {
 *     	"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0OTkxNDM2ODQxNjJ9.4gVrk0o_pyYt_X5z-FfdSEFuGGFxeEsQP8QBjNqI9EA",
 *      "expires": 1499143684162,
 *      "user": {
 *       "name": "Tarun",
 *       "role": "admin",
 *       "language": "en",
 *       "password": "xxx",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *       }
 *     }
 **/
exports.login = function(req, res) {

	//parse response
	console.log(req.body.user)
	console.log(req.session.user);

	console.log(req.body)
	console.log(typeof req.body.user)
	var user = JSON.parse(req.body.user);
	var name = user.name || '';
	var password = user.password || '';
	var query = {
		'name': {
			$regex: new RegExp("^" + name + "$", "i")
		},
		'password': {
			$regex: new RegExp("^" + password + "$", "i")
		}
	};

	if (typeof user.role == "object" && user.role.length > 0) {
		query['$or'] = [];
		user.role.forEach(function(rl) {
			query.$or.push({
				role: {
					$regex: new RegExp("^" + rl + "$", "i")
				}
			});
		});
	} else if (user.role) {
		var role = user.role || 'student';
		query.role = {
			$regex: new RegExp("^" + role + "$", "i")
		};
	} else {
		query['$or'] = [
			{
				role: {
					$regex: new RegExp("^student$", "i")
				}
			},
			{
				role: {
					$regex: new RegExp("^teacher$", "i")
				}
			}
		];
	}

	//find user by name & password
	users.getAllUsers(query, {}, function(users) {

		if (users && users.length > 0) {

			//take the first user incase of multple matches
			user = users[0];

			var maxAge = req.iniconfig.security.max_age;
			var maxAgeTfa = req.iniconfig.security.max_age_TFA;
			// If authentication is success, we will generate a token and dispatch it to the client
			if (user.tfa === false || typeof user.tfa === "undefined") {
				res.send(genToken(user, maxAge, false));
			} else {
				delete user.deployments;
				res.send(genToken(user, maxAgeTfa, true)); //give users a buffer of 30 mins to verify.
			}
		} else {
			res.status(401).send({
				'error': "Invalid credentials",
				'code': 1
			});
		}
		return;
	});
};
exports.verify2FA = function(req, res) {

	if (!req.body.userToken) {
		return res.status(401).send({
			'error': 'User Token not defined',
			'code': 31
		});
	}

	//token that the user entered
	var uniqueToken = req.body.userToken;

	var uid = req.user._id; // unique uid.

	//find user by user id.
	users.getAllUsers({
		_id: new mongo.ObjectID(uid),
		verified: {
			$ne: false
		}
	}, {enableSecret: true}, function(users) {
		if (users && users.length > 0) {

			//take the first user incase of multple matches
			var user = users[0];
			var uniqueSecret = user.uniqueSecret;
			try {
				var isValid = otplib.authenticator.check(uniqueToken, uniqueSecret);
			} catch (err) {
				res.status(401).send({
					'error': 'Could not verify OTP error in otplib',
					'code': 32
				});
			}

			var maxAge = req.iniconfig.security.max_age;
			var maxAgeTfa = req.iniconfig.security.max_age_TFA;

			if (isValid === true) {
				delete user.uniqueSecret;
				// refresh the user token and set partial to false.
				res.send(genToken(user, maxAge, false));
			} else {
				delete user.deployments;
				delete user.uniqueSecret;
				res.send(genToken(user, maxAgeTfa, true));
			}
		} else {
			res.status(401).send({
				'error': "User not found",
				'code': 1
			});
		}
		return;
	});
};

/**
 * @api {post} auth/signup/ Signup User
 * @apiName Signup User
 * @apiDescription Add a new user (Admin or Student). Return the user created. Additionally, before signing up, check if the new name does not already exist.
 *
 * For security reason, call to signup for an Admin is only allowed from the server address.
 * @apiGroup Auth
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} _id Unique user id
 * @apiSuccess {String} name User name
 * @apiSuccess {String} role User role (student or admin)
 * @apiSuccess {Object} color Buddy color
 * @apiSuccess {String} color.stroke Buddy strike color
 * @apiSuccess {String} color.fill Buddy fill color
 * @apiSuccess {String[]} favorites Ids list of activities in the favorite view
 * @apiSuccess {String} language Language setting of the user
 * @apiSuccess {String} password password of the user
 * @apiSuccess {String} private_journal Id of the private journal on the server
 * @apiSuccess {String} shared_journal Id of the shared journal on the server (the same for all users)
 * @apiSuccess {Number} timestamp when the user was created on the server
 * @apiSuccess {Boolean} [beforeSignup] Flag to check for name validity
 *
 * @apiSuccessExample Success-Response(Student):
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tarun",
 *       "role": "student",
 *       "color": {
 *         "stroke": "#00A0FF",
 *         "fill": "#00B20D"
 *       },
 *       "favorites": [],
 *       "language": "en",
 *       "password": "xxx",
 *       "private_journal": "5569f4b019e0b4c9525b3c96",
 *       "shared_journal": "536d30874326e55f2a22816f",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }
 *
 * @apiSuccessExample Success-Response(Before signup):
 *     HTTP/1.1 200 OK
 *     {
 *       "exists": false
 *    }
 *
 * @apiSuccessExample Success-Response(Admin):
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Tarun",
 *       "role": "admin",
 *       "language": "en",
 *       "password": "xxx",
 *       "timestamp": 1423341000747,
 *       "_id": "5569f4b019e0b4c9525b3c97"
 *    }*
 **/
exports.signup = function(req, res) {

	var user = JSON.parse(req.body.user);
	if(user.beforeSignup) {
		validateUsername(user.name, function(user) {
			if(user == false) {
				res.send({
					'exists': false
				});
			} else {
				res.status(401).send({
					'exists': true,
					'error': 'User with same name already exist',
					'code': 22
				});
			}
		});
	} else {
		//insert the user using the same logic but without auth
		users.addUser(req, res);
	}
};

function validateUsername(name, callback) {
	users.getAllUsers({
		'name': {
			$regex: new RegExp("^" + name + "$", "i")
		}
	}, {}, function(users) {
		if (users.length > 0) {
			callback(users[0]);
		} else {
			callback(false);
		}
	});
}

exports.validateUser = function(uid, callback) {

	//parse response
	users.getAllUsers({
		'_id': new mongo.ObjectID(uid)
	}, {}, function(users) {
		if (users.length > 0) {
			callback(users[0]);
		} else {
			callback(false);
		}
	});
};

//update user time stamp function
exports.updateTimestamp = function(uid, callback) {

	//update user time stamp function
	users.updateUserTimestamp(uid, callback);
};

//check role
exports.allowedRoles = function (roles) {
	return function (req, res, next) {
		if (roles.includes(req.user.role)) {
			if (req.user.role == "teacher") {
				if (req.params.uid) {
					if ((req.user._id == req.params.uid) || (req.user.students && (req.user.students.includes(req.params.uid)))) {
						return next();
					}
				} else if (req.params.classid) {
					if ((req.user._id == req.params.classid) || (req.user.classrooms && (req.user.classrooms.includes(req.params.classid)))) {
						return next();
					}
				} else {
					return next();
				}
			} else if (req.user.role == 'student') {
				if (req.params.uid) {
					if (req.user._id == req.params.uid) {
						return next();
					}
				} else if (req.params.jid) {
					if ([req.user.private_journal.toString(), req.user.shared_journal.toString()].includes(req.params.jid)) {
						return next();
					} else {
						return res.status(401).send({
							'error': 'You don\'t have permission to access this journal',
							'code': 8
						});
					}
				} else {
					return next();
				}
			} else {
				return next();
			}
		}
		res.status(401).send({
			'error': 'You don\'t have permission to perform this action',
			'code': 19
		});
	};
};

exports.checkAdminOrLocal = function(req, res, next) {
	var whishedRole = 'student';
	if (req.body && req.body.user) {
		var user = JSON.parse(req.body.user);
		whishedRole = user.role.toLowerCase();
	}
	if (whishedRole == 'student' && security.no_signup_mode) {
		return res.status(401).send({
			'error': 'You don\'t have permission to perform this action',
			'code': 19
		});
	}
	var ip = common.getClientIP(req);
	var serverIp = common.getServerIP();
	if (whishedRole == 'admin' && serverIp.indexOf(ip) == -1) {
		return res.status(401).send({
			'error': 'You don\'t have permission to perform this action',
			'code': 19
		});
	}
	next();
};

// private method
function genToken(user, age, partial) {
	var expires = expiresIn(age);
	var token = jwt.encode({
		partial: partial,
		exp: expires
	}, secret);

	return {
		token: token,
		expires: expires,
		user: user,
		partial: partial
	};
}

function expiresIn(numMs) {
	var dateObj = new Date();
	return dateObj.setTime(dateObj.getTime() + parseInt(numMs));
}

var jwt = require('jwt-simple'),
	users = require('./users.js'),
	mongo = require('mongodb'),
	journal = require('./journal');

var BSON = mongo.BSONPure;

exports.login = function(req, res) {

	//parse response
	var user = JSON.parse(req.body.user);
	var name = user.name || '';
	var password = user.password || '';
	var role = user.role || 'student';
	var query = {
		'name': {
			$regex: new RegExp("^" + name + "$", "i")
		},
		'password': {
			$regex: new RegExp("^" + password + "$", "i")
		},
		'role': {
			$regex: new RegExp("^" + role + "$", "i")
		}
	};

	//find user by name & password
	users.getAllUsers(query, {}, function(users) {

		if (users.length > 0) {

			//take the first user incase of multple matches
			user = users[0];

			// If authentication is success, we will generate a token and dispatch it to the client
			res.send(genToken(user));

		} else {
			res.status(401).send({
				"message": "Invalid credentials"
			});
		}
		return;
	});
};

exports.signup = function(req, res) {

	//insert the user using the same logic but without auth
	users.addUser(req, res);
};

exports.validateUser = function(uid, callback) {

	//parse response
	users.getAllUsers({
		'_id': new BSON.ObjectID(uid)
	}, {}, function(users) {
		if (users.length > 0) {
			callback(users[0]);
		} else {
			callback(false);
		}
	});
};

// private method
function genToken(user) {
	var expires = expiresIn(7); // 7 days
	var token = jwt.encode({
		exp: expires
	}, require('../config/secret')());

	return {
		token: token,
		expires: expires,
		user: user
	};
}

function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}

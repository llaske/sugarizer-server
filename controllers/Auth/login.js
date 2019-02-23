var jwt = require('jwt-simple'),
	users = require('../../api/controller/users');

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
			var maxAge = req.iniconfig.security.max_age;
			res.send(genToken(user, maxAge));
		} else {
			res.status(401).send({
				'error': "Invalid credentials",
				'code': 1
			});
		}
		return;
	});
};

// private method
function genToken(user, age) {
	var expires = expiresIn(age);
	var token = jwt.encode({
		exp: expires
	}, require('../../config/secret')());

	return {
		token: token,
		expires: expires,
		user: user
	};
}

function expiresIn(numMs) {
	var dateObj = new Date();
	return dateObj.setTime(dateObj.getTime() + parseInt(numMs));
}

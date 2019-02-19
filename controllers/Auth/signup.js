var users = require('../../api/controller/users');
/**
 * @api {post} auth/signup/ Signup User
 * @apiName Signup User
 * @apiDescription Add a new user (Admin or Student). Return the user created.
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

	//insert the user using the same logic but without auth
	users.addUser(req, res);
};
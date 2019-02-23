var users = require('../../api/controller/users')

//update user time stamp function
exports.updateTimestamp = function(uid, callback) {

	//update user time stamp function
	users.updateUserTimestamp(uid, callback)
}

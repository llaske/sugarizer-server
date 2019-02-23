var users = users = require('../../api/controller/users'),
	mongo = require('mongodb');


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

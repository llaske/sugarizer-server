// include libraries
var getLogin = require('./getLogin'),
	logout = require('./logout'),
	postLogin = require('./postLogin'),
	validateSession = require('./validateSession'),
	checkRole = require('./checkRole');

// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

exports.ini = function() {
	return ini;
};

exports.getLogin = getLogin;
exports.logout = logout;
exports.postLogin = postLogin;
exports.validateSession = validateSession;
exports.checkRole = checkRole;

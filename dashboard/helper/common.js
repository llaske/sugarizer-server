var ini = null;

exports.init = function(settings) {
	ini = settings;
}

exports.getHeaders = function(req) {

	// headers
	return {
		"content-type": "application/json",
		"x-access-token": (req.session.user ? req.session.user.token : ""),
		"x-key": (req.session.user ? req.session.user.user._id : ""),
	}
}

exports.getAPIUrl = function(req) {
	return 'http://localhost:' + ini.web.port + '/';
}

// include libraries
var superagent = require('superagent'),
	common = require('../../../helper/common');

exports.getActivity = function(req, aid, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/activities/' + aid)
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {
				// callback
				callback(response.body);
			}
		});
};

exports.getUser = function(req, uid, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/users/' + uid)
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {
				// callback
				callback(response.body);
			} else {
				callback();
			}
		});
};

exports.formQueryString = function(params) {
	var str = [];
	for (var p in params)
		if (p && Object.prototype.hasOwnProperty.call(params, p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
		}
	return '?' + str.join("&");
};

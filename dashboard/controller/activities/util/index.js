// include libraries
var request = require('request'),
	common = require('../../../helper/common');

exports.getActivity = function(req, aid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities/' + aid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body);
		}
	});
};

exports.getUser = function(req, uid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/users/' + uid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body);
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

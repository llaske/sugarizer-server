// include libraries
var request = require('request'),
    common = require('../helper/common');

function getActivity(req, aid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities/' + aid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body)
		}
	});
}

function getUser(req, uid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/users/' + uid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body)
		}
	});
}

function formQueryString(params) {
	var str = [];
	for (var p in params)
		if (params.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
		}
	return '?' + str.join("&");
}

export {
    getActivity,
    getUser,
    formQueryString
};

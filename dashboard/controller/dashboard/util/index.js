// include libraries
var request = require('request'),
	common = require('../../../helper/common');


exports.getAllJournals = function(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/journal'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//callback
			callback(body);

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.getAllActivities = function(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//callback
			callback(body);

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.getAllUsers = function(req, res, callback) {
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			role: 'student',
			sort: '-timestamp',
			limit: 100000000
		},
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			//callback
			callback(body);

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.getAllClassrooms = function(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/classrooms'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//callback
			callback(body);

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

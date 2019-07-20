// include libraries
var request = require('request'),
	common = require('../../../helper/common');

exports.getActivities = function(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities/'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			//store
			callback(body);
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/journal');
		}
	});
};

exports.getJournalEntries = function(req, res, query, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			uid: query.uid,
			offset: query.offset,
			limit: query.limit,
			sort: query.sort,
		},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + query.journal
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//store
			callback(body);
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/journal');
		}
	});
};

exports.getUsers = function(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '-timestamp',
			role: 'student',
			limit: 100000000
		},
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			callback(body.users);
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/journal');
		}
	});
};

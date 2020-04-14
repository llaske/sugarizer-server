// include libraries
var superagent = require('superagent'),
	common = require('../../../helper/common');

exports.getActivities = function(req, res, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/activities/')
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {
				//store
				callback(response.body);
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/journal');
			}
		});
};

exports.getJournalEntries = function(req, res, query, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/journal/' + query.journal)
		.set(common.getHeaders(req))
		.query({
			uid: query.uid,
			offset: query.offset,
			limit: query.limit,
			sort: query.sort,
		})
		.end(function (error, response) {
			if (response.statusCode == 200) {

				//store
				callback(response.body);
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/journal');
			}
		});
};

exports.getUser = function(req, res, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/users/' + req.query.uid)
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {

				callback(response.body);
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/journal');
			}
		});
};

exports.getSharedJournalId = function(req, res, callback) {
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/journal')
		.set(common.getHeaders(req))
		.query({
			type: "shared"
		})
		.end(function (error, response) {
			if (response.statusCode == 200 && response.body && response.body.length > 0 && response.body[0]._id) {
				callback(response.body[0]._id);
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/journal');
			}
		});
};

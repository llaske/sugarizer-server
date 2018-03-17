// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	// reinit l10n and moment with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
		moment.locale(req.query.lang);
	}

	getUsers(req, res, function(users) {
		res.render('journal', {
			module: 'journals',
			moment: moment,
			entries: [],
			query: {
				uid: -1,
				type: 'private'
			},
			users: users,
			account: req.session.user
		});
	});
};

// delete entry
exports.deleteEntry = function(req, res) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'DELETE',
		qs: {
			oid: req.params.oid,
			type: 'partial'
		},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + req.params.jid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// return back
			req.flash('success', {
				msg: common.l10n.get('EntryDeleted')
			});
			return res.redirect('/dashboard/journal/' + req.params.jid + '?uid=' + req.query.uid + '&offset=' + (req.query.offset ? req.query.offset : 0) + '&limit=' + (req.query.limit ? req.query.limit : 10));

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/journal/' + req.params.jid + '?uid=' + req.query.uid + '&offset=' + (req.query.offset ? req.query.offset : 0) + '&limit=' + (req.query.limit ? req.query.limit : 10));
		}
	})
};

exports.getEntries = function(req, res) {

	//get users
	getUsers(req, res, function(users) {

		var query = {
			uid: req.query.uid,
			journal: req.params.jid,
			type: req.query.type,
			limit: (req.query.limit ? req.query.limit : 10),
			offset: (req.query.offset ? req.query.offset : 0)
		}

		//get activties
		getActivities(req, res, function(activities) {

			//make hashlist
			var hashList = {};
			for (var i = 0; i < activities.length; i++) {
				hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon
			}

			//get entries
			getJournalEntries(req, res, query, function(entries) {

				//render template
				res.render('journal', {
					module: 'journals',
					moment: moment,
					entries: entries,
					iconList: hashList,
					query: query,
					users: users,
					account: req.session.user
				});
			});
		})
	});
}

function getActivities(req, res, callback) {
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
	})
}

function getJournalEntries(req, res, query, callback) {

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			uid: query.uid,
			offset: query.offset,
			limit: query.limit,
			sort: "-timestamp",
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
	})
}

function getUsers(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '+name',
			role: 'student'
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
	})
}

// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {
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


exports.getEntries = function(req, res) {

	//get users
	getUsers(req, res, function(users) {

		var query = {
			uid: req.query.uid,
			journal: req.params.jid,
			type: req.query.type,
			limit: (req.query.limit ? req.query.limit : 5),
			offset: (req.query.offset ? req.query.offset : 0)
		}

		//get entries
		getJournalEntries(req, res, query, function(entries) {

			res.render('journal', {
				module: 'journals',
				moment: moment,
				entries: entries,
				query: query,
				users: users,
				account: req.session.user
			});

		});
	});
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
		},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + query.journal
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//store
			callback(body);
		} else {
			req.flash('errors', {
				msg: body.message
			});
			//@TODO
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
				msg: body.message
			});
			//@TODO
		}
	})
}

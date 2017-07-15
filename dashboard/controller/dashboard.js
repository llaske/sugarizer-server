// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	var data = {};

	//get all users
	getAllUsers(req, res, function(usersResponse) {

		// store
		data.users = usersResponse;

		//get all activities
		getAllActivities(req, res, function(activitiesResponse) {

			// store
			data.activities = activitiesResponse;

			//get journal data
			getAllJournals(req, res, function(journalResponse) {

				//process
				var d = {}
				d.totalJournal = journalResponse.length;
				d.totalEntries = 0;
				for (var i = 0; i < journalResponse.length; i++) {
					d.totalEntries += journalResponse[i].count;
				}

				//store
				data.journal = d;

				// send to login page
				res.render('dashboard', {
					title: 'dashboard',
					module: 'dashboard',
					data: data,
					account: req.session.user
				});
			});
		})
	})
};

function getAllJournals(req, res, callback) {
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
				msg: body.message
			});
		}
	})
}

function getAllActivities(req, res, callback) {
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
				msg: body.message
			});
		}
	})
}

function getAllUsers(req, res, callback) {
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			role: 'student'
		},
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			//callback
			callback(body);

		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	});
}

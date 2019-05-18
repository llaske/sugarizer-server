// include libraries
var request = require('request'),
	moment = require('moment'),
	dashboard_utils = require('../dashboard/util'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji');

var classroom = require('./index');

module.exports = function addClassroom(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.students = req.body.students || [];
		if (typeof req.body.students == 'string') {
			req.body.students = [req.body.students];
		}
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('UsernameInvalid')).matches(/^[a-z0-9 ]+$/i);
		req.body.options = { sync: true, stats: true };

		// get errors
		var errors = req.validationErrors();

		// call
		if (!errors) {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'post',
				body: {
					classroom: JSON.stringify(req.body)
				},
				uri: common.getAPIUrl(req) + 'api/v1/classrooms'
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					// send to classrooms page
					req.flash('success', {
						msg: common.l10n.get('ClassroomCreated', {name: req.body.name})
					});
					return res.redirect('/dashboard/classrooms/');
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+body.code)
					});
					return res.redirect('/dashboard/classrooms/add');
				}
			});
		} else {
			req.flash('errors', errors);
			return res.redirect('/dashboard/classrooms/add');
		}

	} else {
		//get all users
		dashboard_utils.getAllUsers(req, res, function(users) {
			// send to classroom page
			res.render('addEditClassroom', {
				module: 'classrooms',
				xocolors: xocolors,
				moment: moment,
				students: users.users,
				emoji: emoji,
				account: req.session.user,
				server: classroom.ini().information
			});
		});
	}
};

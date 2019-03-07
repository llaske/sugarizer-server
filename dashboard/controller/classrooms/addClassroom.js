// include libraries
var request = require('request'),
	moment = require('moment'),
	dashboard = require('../dashboard'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji');

var classroom = require('./index');

module.exports = function addClassroom(req, res) {

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.students = req.body.students || [];
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('NameNotAlphanumeric')).matches(/^[a-z0-9 ]+$/i);
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
						msg: common.l10n.get('ClassroomCreated')
					});
					return res.redirect('/dashboard/classrooms/edit/' + body._id);
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
		dashboard.getAllUsers(req, res, function(users) {
			// send to classroom page
			res.render('addEditClassroom', {
				module: 'classrooms',
				moment: moment,
				students: users.users,
				emoji: emoji,
				xocolors: xocolors,
				account: req.session.user,
				server: classroom.ini().information
			});
		});
	}
};

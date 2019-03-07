// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji');

var classroom = require('./index');

module.exports = function editClassroom(req, res) {

	if (req.params.classid) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.students = req.body.students || [];
			req.body.color = JSON.parse(req.body.color);

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				request({
					headers: common.getHeaders(req),
					json: true,
					method: 'put',
					body: {
						classroom: JSON.stringify(req.body)
					},
					uri: common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid
				}, function(error, response, body) {
					if (response.statusCode == 200) {

						// send back
						req.flash('success', {
							msg: common.l10n.get('ClassroomUpdated')
						});
						return res.redirect('/dashboard/classrooms/edit/' + req.params.classid);
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+body.code)
						});
						return res.redirect('/dashboard/classrooms/edit/' + req.params.classid);
					}
				});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/classrooms/edit/' + req.params.classid);
			}
		} else {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'get',
				uri: common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					// send to classrooms page
					res.render('addEditClassroom', {
						module: 'classrooms',
						moment: moment,
						classroom: body,
						emoji: emoji,
						xocolors: xocolors,
						account: req.session.user,
						server: classroom.ini().information
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+body.code)
					});
					return res.redirect('/dashboard/classrooms');
				}
			});
		}
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/classrooms');
	}
};

// include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji');

var classroom = require('./index');

module.exports = function editClassroom(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.params.classid) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.students = req.body.students || [];
			
			if (typeof req.body.students == 'string') {
				req.body.students = [req.body.students];
			}

			req.body.color = req.body.color;
			req.assert('name', common.l10n.get('UsernameInvalid')).matches(/^[a-z0-9 ]+$/i);

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				superagent
					.put(common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid)
					.set(common.getHeaders(req))
					.send({
						classroom: JSON.stringify(req.body)
					})
					.end(function (error, response) {
						if (response.statusCode == 200) {

							// send back
							req.flash('success', {
								msg: common.l10n.get('ClassroomUpdated', {name: req.body.name})
							});
							return res.redirect('/dashboard/classrooms/');
						} else {
							req.flash('errors', {
								msg: common.l10n.get('ErrorCode'+response.body.code)
							});
							return res.redirect('/dashboard/classrooms/edit/' + req.params.classid);
						}
					});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/classrooms/edit/' + req.params.classid);
			}
		} else {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid)
				.set(common.getHeaders(req))
				.end(function (error, response) {
					if (response.statusCode == 200) {

						// send to classrooms page
						res.render('admin/addEditClassroom', {
							module: 'classrooms',
							mode: "edit",
							classroom: response.body,
							moment: moment,
							emoji: emoji,
							xocolors: xocolors,
							account: req.session.user,
							server: classroom.ini().information
						});
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+response.body.code)
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

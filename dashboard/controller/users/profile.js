// include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji'),
	regexValidate = require('../../helper/regexValidate'),
	dashboard_utils = require('../dashboard/util');

var users = require('./index');

module.exports = function profile(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.session && req.session.user && req.session.user.user && req.session.user.user._id) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.password = req.body.password.trim();
			req.body.color = JSON.parse(req.body.color);
			req.assert('name', common.l10n.get('UsernameInvalid')).matches(regexValidate("user"));
			req.assert('password', common.l10n.get('PasswordAtLeast', {count:users.ini().security.min_password_size})).len(users.ini().security.min_password_size);
			req.assert('password', common.l10n.get('PasswordInvalid')).matches(regexValidate("pass"));
			if (typeof req.body.classrooms == 'string') {
				req.body.classrooms = [req.body.classrooms];
			}

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				superagent
					.put(common.getAPIUrl(req) + 'api/v1/users/' + req.session.user.user._id)
					.set(common.getHeaders(req))
					.send({
						user: JSON.stringify(req.body)
					})
					.end(function (error, response) {
						if (response.statusCode == 200) {
							req.flash('success', {
								msg: common.l10n.get('UserUpdated', {name: req.body.name})
							});
						} else {
							req.flash('errors', {
								msg: common.l10n.get('ErrorCode'+response.body.code)
							});
						}
						return res.redirect('/dashboard/profile');
					});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/profile');
			}
		} else {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/users/' + req.session.user.user._id)
				.set(common.getHeaders(req))
				.end(function (error, response) {
					var user = response.body;
					if (error) {
						req.flash('errors', {
							msg: common.l10n.get('ThereIsError')
						});
						return res.redirect('/dashboard/profile');
					} else if (response.statusCode == 200) {
						if (user && user.role == 'teacher') {
							// fetch classrooms
							dashboard_utils.getAllClassrooms(req, res, function(classrooms) {
								if (user.classrooms && typeof(user.classrooms) == "object" && user.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
									for (var i=0; i<classrooms.classrooms.length; i++) {
										if (user.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
											classrooms.classrooms[i]['is_member'] = true;
										}
									}
								}
								res.render('addEditUser', {
									module: 'profile',
									user: user,
									mode: "edit",
									classrooms: classrooms.classrooms,
									xocolors: xocolors,
									moment: moment,
									emoji: emoji,
									account: req.session.user,
									server: users.ini().information
								});
							});
						} else {
							// send to users page
							res.render('addEditUser', {
								module: 'profile',
								user: user,
								mode: "edit",
								moment: moment,
								emoji: emoji,
								xocolors: xocolors,
								account: req.session.user,
								server: users.ini().information
							});
						}
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+user.code)
						});
						return res.redirect('/dashboard/profile');
					}
				});
		}
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/profile');
	}
};

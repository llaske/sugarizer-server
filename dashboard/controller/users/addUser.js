// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji'),
	regexValidate = require('../../helper/regexValidate'),
	dashboard_utils = require('../dashboard/util');

var users = require('./index');

module.exports = function addUser(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.password = req.body.password.trim();
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('UsernameInvalid')).matches(regexValidate("user"));
		req.assert('password', common.l10n.get('PasswordAtLeast', {count:users.ini().security.min_password_size})).len(users.ini().security.min_password_size);
		req.assert('password', common.l10n.get('PasswordInvalid')).matches(regexValidate("pass"));
		req.body.options = { sync: true, stats: true };
		req.body.role = req.body.role.trim();
		if (req.body.role == 'teacher') {
			req.body.classrooms = req.body.classrooms || [];
			if (typeof req.body.classrooms == 'string') {
				req.body.classrooms = [req.body.classrooms];
			}
		} else {
			delete req.body.classrooms;
		}

		// get errors
		var errors = req.validationErrors();

		// call
		if (!errors) {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'post',
				body: {
					user: JSON.stringify(req.body)
				},
				uri: common.getAPIUrl(req) + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {
					req.flash('success', {
						msg: common.l10n.get('UserCreated', {name: req.body.name})
					});
					if (body.role == "admin") {
						// send to admin page
						return res.redirect('/dashboard/users/?role=admin');
					} else if (body.role == "teacher") {
						// send to teacher page
						return res.redirect('/dashboard/users/?role=teacher');
					} else {
						// send to users page
						return res.redirect('/dashboard/users/');
					}
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+body.code)
					});
					return res.redirect('/dashboard/users/add');
				}
			});
		} else {
			dashboard_utils.getAllClassrooms(req, res, function(classrooms) {
				if (req.body.classrooms && typeof(req.body.classrooms) == "object" && req.body.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
					for (var i=0; i<classrooms.classrooms.length; i++) {
						if (req.body.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
							classrooms.classrooms[i]['is_member'] = true;
						}
					}
				}
				req.flash('errors', errors);
				return res.render('admin/addEditUser', {
					module: 'users',
					user: {
						name:req.body.name,
						password: req.body.password,
						color: req.body.color,
						language:req.body.language,
						role:req.body.role
					},
					classrooms: classrooms.classrooms,
					xocolors: xocolors,
					moment: moment,
					emoji: emoji,
					account: req.session.user,
					server: users.ini().information,
					role: req.role
				});
			});
		}

	} else {
		dashboard_utils.getAllClassrooms(req, res, function(classrooms) {
			res.render('admin/addEditUser', {
				module: 'users',
				classrooms: classrooms.classrooms,
				xocolors: xocolors,
				mode: "add",
				moment: moment,
				emoji: emoji,
				account: req.session.user,
				server: users.ini().information,
				role: req.role
			});
		});
	}
};

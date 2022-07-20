// include libraries
var superagent = require('superagent'),
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
		req.assert('password', common.l10n.get('PasswordAtLeast', { count: users.ini().security.min_password_size })).len(users.ini().security.min_password_size);
		req.assert('password', common.l10n.get('PasswordInvalid')).matches(regexValidate("pass"));
		req.body.options = { sync: true, stats: true };
		req.body.role = req.body.role.trim();
		if (req.body.role == "admin") {
			delete req.body.classrooms;
		} else {
			req.body.classrooms = req.body.classrooms || [];
			if (typeof req.body.classrooms == 'string') {
				req.body.classrooms = [req.body.classrooms];
			}
		}

		if (req.session && req.session.user && req.session.user.user && req.session.user.user.role == "teacher") {
			if ((!req.body.classrooms) || !(req.body.classrooms.length > 0)) {
				req.flash('errors', {
					msg: common.l10n.get('EmptyClassroom')
				});
				return res.redirect('/dashboard/users/add');
			}
		}

		// get errors
		var errors = req.validationErrors();

		// call
		if (!errors) {
			superagent
				.post(common.getAPIUrl(req) + 'api/v1/users')
				.set(common.getHeaders(req))
				.send({
					user: JSON.stringify(req.body)
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (req.body.role == "student" && req.body.classrooms && typeof (req.body.classrooms) == "object" && req.body.classrooms.length > 0) {
							dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
								if (classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
									var classroomCounter = 0;
									for (var i = 0; i < classrooms.classrooms.length; i++) {
										if (req.body.classrooms.includes(classrooms.classrooms[i]._id)) {
											if (typeof classrooms.classrooms[i].students == "object" && classrooms.classrooms[i].students.length > 0) {
												if (!classrooms.classrooms[i].students.includes(response.body._id)) {
													classrooms.classrooms[i].students.push(response.body._id);
												}
											} else {
												classrooms.classrooms[i].students = [response.body._id];
											}
											superagent
												.put(common.getAPIUrl(req) + 'api/v1/classrooms/' + classrooms.classrooms[i]._id)
												.set(common.getHeaders(req))
												.send({
													classroom: JSON.stringify({
														students: classrooms.classrooms[i].students
													})
												})
												.end(function () {
													classroomCounter++;
													if (classroomCounter == req.body.classrooms.length) {
														req.flash('success', {
															msg: common.l10n.get('UserCreated', { name: req.body.name })
														});
														return res.redirect('/dashboard/users/');
													}
												});
										}
									}
								} else {
									req.flash('success', {
										msg: common.l10n.get('UserCreated', { name: req.body.name })
									});
									return res.redirect('/dashboard/users/');
								}
							});
						} else {
							req.flash('success', {
								msg: common.l10n.get('UserCreated', { name: req.body.name })
							});
							if (response.body.role == "admin") {
								// send to admin page
								return res.redirect('/dashboard/users/?role=admin');
							} else if (response.body.role == "teacher") {
								// send to teacher page
								return res.redirect('/dashboard/users/?role=teacher');
							} else {
								// send to users page
								return res.redirect('/dashboard/users/');
							}
						}
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode' + response.body.code)
						});
						return res.redirect('/dashboard/users/add');
					}
				});
		} else {
			dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
				if (req.body.classrooms && typeof (req.body.classrooms) == "object" && req.body.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
					for (var i = 0; i < classrooms.classrooms.length; i++) {
						if (req.body.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
							classrooms.classrooms[i]['is_member'] = true;
						}
					}
				}
				req.flash('errors', errors);
				return res.render('addEditUser', {
					module: 'users',
					user: {
						name: req.body.name,
						password: req.body.password,
						color: req.body.color,
						language: req.body.language,
						role: req.body.role
					},
					classrooms: classrooms.classrooms,
					xocolors: xocolors,
					mode: "add",
					moment: moment,
					emoji: emoji,
					account: req.session.user,
					server: users.ini().information
				});
			});
		}

	} else {
		dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
			res.render('addEditUser', {
				module: 'users',
				classrooms: classrooms.classrooms,
				xocolors: xocolors,
				mode: "add",
				moment: moment,
				emoji: emoji,
				account: req.session.user,
				server: users.ini().information
			});
		});
	}
};

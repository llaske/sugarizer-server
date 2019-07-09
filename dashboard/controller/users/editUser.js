// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji'),
	regexValidate = require('../../helper/regexValidate'),
	dashboard_utils = require('../dashboard/util');

var users = require('./index');

module.exports = function editUser(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.params.uid) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.password = req.body.password.trim();
			req.body.color = JSON.parse(req.body.color);
			req.assert('name', common.l10n.get('UsernameInvalid')).matches(regexValidate("user"));
			req.assert('password', common.l10n.get('PasswordAtLeast', {count:users.ini().security.min_password_size})).len(users.ini().security.min_password_size);
			req.assert('password', common.l10n.get('PasswordInvalid')).matches(regexValidate("pass"));
			req.body.classrooms = req.body.classrooms || [];
			if (typeof req.body.classrooms == 'string') {
				req.body.classrooms = [req.body.classrooms];
			}

			if (req.session &&  req.session.user && req.session.user.user && req.session.user.user.role == "teacher") {
				if ((!req.body.classrooms) || !(req.body.classrooms.length > 0)) {
					req.flash('errors', {
						msg: common.l10n.get('EmptyClassroom')
					});
					return res.redirect('/dashboard/users/edit/' + req.params.uid);
				}
			}

			// get errors
			var errors = req.validationErrors();

			if (!errors) {
				request({
					headers: common.getHeaders(req),
					json: true,
					method: 'put',
					body: {
						user: JSON.stringify(req.body)
					},
					uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
				}, function(error, response, body) {
					if (response.statusCode == 200) {
						if (body.role=="student" && typeof(req.body.classrooms) == "object") {
							dashboard_utils.getAllClassrooms(req, res, function(classrooms) {
								if (classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
									var classroomCounter = 0;
									var classroomRequests = 0;
									for (var i=0; i<classrooms.classrooms.length; i++) {
										classrooms.classrooms[i].students = classrooms.classrooms[i].students || [];
										if (req.body.classrooms.includes(classrooms.classrooms[i]._id) || classrooms.classrooms[i].students.includes(body._id)) {
											classroomRequests++;
											if (req.body.classrooms.includes(classrooms.classrooms[i]._id)) {
												if (classrooms.classrooms[i].students.length > 0) {
													if (!classrooms.classrooms[i].students.includes(body._id)) {
														classrooms.classrooms[i].students.push(body._id);
													}
												} else {
													classrooms.classrooms[i].students = [body._id];
												}
											} else {
												classrooms.classrooms[i].students = classrooms.classrooms[i].students.filter(function(value){
													return (value != body._id && value != null);
												});
											}

											request({
												headers: common.getHeaders(req),
												json: true,
												method: 'put',
												body: {
													classroom: JSON.stringify({
														students: classrooms.classrooms[i].students
													})
												},
												uri: common.getAPIUrl(req) + 'api/v1/classrooms/' + classrooms.classrooms[i]._id
											}, function() {
												classroomCounter++;
												if (classroomCounter == classroomRequests) {
													req.flash('success', {
														msg: common.l10n.get('UserUpdated', {name: req.body.name})
													});
													return res.redirect('/dashboard/users/');
												}
											});
										}
									}
									if (classroomRequests == 0) {
										if (classroomCounter == classroomRequests) {
											req.flash('success', {
												msg: common.l10n.get('UserUpdated', {name: req.body.name})
											});
											return res.redirect('/dashboard/users/');
										}
									}
								} else {
									req.flash('success', {
										msg: common.l10n.get('UserUpdated', {name: req.body.name})
									});
									return res.redirect('/dashboard/users/');
								}
							});
						} else {
							req.flash('success', {
								msg: common.l10n.get('UserUpdated', {name: req.body.name})
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
						}
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+body.code)
						});
						return res.redirect('/dashboard/users/edit/' + req.params.uid);
					}
				});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/users/edit/' + req.params.uid);
			}
		} else {
			request({
				headers: common.getHeaders(req),
				json: true,
				method: 'get',
				uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
			}, function(error, response, user) {
				if (error) {
					req.flash('errors', {
						msg: common.l10n.get('ThereIsError')
					});
					return res.redirect('/dashboard/users');
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
								module: 'users',
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
					} else if (user && user.role == 'student') {
						dashboard_utils.getAllClassrooms(req, res, function(classrooms) {
							if (classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
								for (var i=0; i<classrooms.classrooms.length; i++) {
									if (typeof classrooms.classrooms[i].students == "object" && classrooms.classrooms[i].students.includes(user._id)) {
										classrooms.classrooms[i]['is_member'] = true;
									}
								}
							}
							res.render('addEditUser', {
								module: 'users',
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
							module: 'users',
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
					return res.redirect('/dashboard/users');
				}
			});
		}
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/users');
	}
};

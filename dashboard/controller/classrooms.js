// include libraries
var request = require('request'),
	moment = require('moment'),
	dashboard = require('./dashboard')
	common = require('../helper/common'),
	xocolors = require('../helper/xocolors')(),
	emoji = require('../public/js/emoji');


// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
}

// main landing page
exports.index = function(req, res) {

	// reinit l10n and moment with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
		moment.locale(req.query.lang);
	}

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.classroom != '') {
		query['q'] = req.query.classroom;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}

    // call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/classrooms'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('classrooms', {
				module: 'classrooms',
				moment: moment,
				query: query,
				data: body,
				account: req.session.user,
				server: ini.information
			});

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.addClassroom = function(req, res) {

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.students = req.body.students || [];
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('NameNotAlphanumeric')).isAlphanumeric();
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
				xocolors: xocolors,
				moment: moment,
				students: users.users,
				emoji: emoji,
				account: req.session.user
			});
		});
	}
};

exports.editClassroom = function(req, res) {

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
					res.render('addEditclassroom', {
						module: 'classrooms',
						classroom: body,
						moment: moment,
						emoji: emoji,
						xocolors: xocolors,
						account: req.session.user
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

exports.deleteClassroom = function(req, res) {

	if (req.params.classid) {
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to classrooms page
				req.flash('success', {
					msg: common.l10n.get('ClassroomDeleted')
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+body.code)
				});
			}
			return res.redirect('/dashboard/classrooms');
		});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/classrooms');
	}
};

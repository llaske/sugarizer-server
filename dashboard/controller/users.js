// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common'),
	xocolors = require('../helper/xocolors')(),
	emoji = require('../public/js/emoji');


// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

// main landing page
exports.index = function(req, res) {

	// reinit l10n and moment with locale
	common.reinitLocale(req);

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.username != '') {
		query['q'] = req.query.username;
	}
	if (req.query.role != '') {
		query['role'] = req.query.role;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	if (req.query.classid != '') {
		query['classid'] = req.query.classid;
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// get classrooms list
			getClassrooms(req, function(classrooms){

				// send to activities page
				res.render('users', {
					module: 'users',
					moment: moment,
					query: query,
					classrooms: classrooms,
					data: body,
					account: req.session.user,
					server: ini.information
				});
			});
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.addUser = function(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.password = req.body.password.trim();
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('UsernameInvalid')).matches(/^[a-z0-9 ]+$/i);
		req.assert('password', common.l10n.get('PasswordAtLeast', {count:ini.security.min_password_size})).len(ini.security.min_password_size);
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
			req.flash('errors', errors);
			return res.render('addEditUser', {
				module: 'users',
				user: {
					name:req.body.name,
					password: req.body.password,
					color: req.body.color,
					language:req.body.language,
					role:req.body.role
				},
				xocolors: xocolors,
				moment: moment,
				emoji: emoji,
				account: req.session.user,
				server: ini.information
			});
		}

	} else {
		// send to activities page
		res.render('addEditUser', {
			module: 'users',
			xocolors: xocolors,
			moment: moment,
			emoji: emoji,
			account: req.session.user,
			server: ini.information
		});
	}
};

exports.editUser = function(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.params.uid) {
		if (req.method == 'POST') {

			// validate
			req.body.name = req.body.name.trim();
			req.body.password = req.body.password.trim();
			req.body.color = JSON.parse(req.body.color);
			req.assert('password', common.l10n.get('PasswordAtLeast', {count:ini.security.min_password_size})).len(ini.security.min_password_size);

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
						req.flash('success', {
							msg: common.l10n.get('UserUpdated', {name: req.body.name})
						});
						if (body.role == "admin") {
							// send to admin page
							return res.redirect('/dashboard/users/?role=admin');
						} else {
							// send to users page
							return res.redirect('/dashboard/users/');
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
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					// send to users page
					res.render('addEditUser', {
						module: 'users',
						user: body,
						moment: moment,
						emoji: emoji,
						xocolors: xocolors,
						account: req.session.user,
						server: ini.information
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+body.code)
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

exports.deleteUser = function(req, res) {

	if (req.params.uid) {
		var role = req.query.role || 'student';
		var name = req.query.name || 'user';
		if (req.params.uid == common.getHeaders(req)['x-key']) {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode20')
			});
			return res.redirect('/dashboard/users/?role='+role);
		}
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to users page
				req.flash('success', {
					msg: common.l10n.get('UserDeleted', {name: name})
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+body.code)
				});
			}
			return res.redirect('/dashboard/users?role='+role);
		});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/users');
	}
};

/**
 * private function
 */
function getClassrooms(req, callback){
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			limit: 100000 // get all possible classes
		},
		uri: common.getAPIUrl(req) + 'api/v1/classrooms'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// return list of classrooms
			callback(body.classrooms);
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
}

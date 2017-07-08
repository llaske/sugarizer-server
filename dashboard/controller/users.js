// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.username != '') {
		query['name'] = req.query.username;
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

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: req.iniconfig.web.api + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('users', {
				module: 'Users',
				moment: moment,
				query: query,
				data: body
			});

		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	});
};

exports.addUser = function(req, res) {

	if (req.method == 'POST') {

		// validate
		req.assert('name', 'Name should be alphanumeric').isAlphanumeric();
		req.assert('password', 'Password should have 6 to 20 characters').len(6, 20);

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
				uri: req.iniconfig.web.api + 'api/v1/users'
			}, function(error, response, body) {
				if (response.statusCode == 200) {

					// send to users page
					req.flash('success', {
						msg: 'User has been successfully created!'
					});
					return res.redirect('/app/users/add');
				} else {
					req.flash('errors', {
						msg: body.error
					});
					return res.redirect('/app/users/add');
				}
			});
		} else {
			req.flash('errors', errors);
			return res.redirect('/app/users/add');
		}

	} else {
		// send to activities page
		res.render('addEditUser', {
			module: 'Users'
		});
	}
};

exports.editUser = function(req, res) {

	if (req.params.uid) {
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'get',
			uri: req.iniconfig.web.api + 'api/v1/users/' + req.params.uid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to users page
				res.render('addEditUser', {
					module: 'Users',
					user: body
				});
			} else {
				req.flash('errors', {
					msg: body.error
				});
				return res.redirect('/app/users');
			}
		});
	} else {
		req.flash('errors', {
			msg: 'There is some error!'
		});
		return res.redirect('/app/users');
	}
};

exports.deleteUser = function(req, res) {

	if (req.params.uid) {
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: req.iniconfig.web.api + 'api/v1/users/' + req.params.uid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to users page
				req.flash('success', {
					msg: 'User has been successfully deleted!'
				});
			} else {
				req.flash('errors', {
					msg: body.error
				});
			}
			return res.redirect('/app/users');
		});
	} else {
		req.flash('errors', {
			msg: 'There is some error!'
		});
		return res.redirect('/app/users');
	}
};

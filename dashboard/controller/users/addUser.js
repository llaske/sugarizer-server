// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji');

var users = require('./index');

module.exports = function addUser(req, res) {

	if (req.method == 'POST') {

		// validate
		req.body.name = req.body.name.trim();
		req.body.password = req.body.password.trim();
		req.body.color = JSON.parse(req.body.color);
		req.assert('name', common.l10n.get('NameNotAlphanumeric')).matches(/^[a-z0-9 ]+$/i);
		req.assert('password', common.l10n.get('PasswordAtLeast', {count:users.ini().security.min_password_size})).len(users.ini().security.min_password_size);
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

					// send to users page
					req.flash('success', {
						msg: common.l10n.get('UserCreated')
					});
					return res.redirect('/dashboard/users/edit/' + body._id);
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+body.code)
					});
					return res.redirect('/dashboard/users/add');
				}
			});
		} else {
			req.flash('errors', errors);
			return res.redirect('/dashboard/users/add');
		}

	} else {
		// send to activities page
		res.render('addEditUser', {
			module: 'users',
			xocolors: xocolors,
			moment: moment,
			emoji: emoji,
			account: req.session.user,
			server: users.ini().information
		});
	}
};

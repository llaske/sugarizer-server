// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji'),
	regexValidate = require('../../helper/regexValidate');

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
				server: users.ini().information
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
			server: users.ini().information
		});
	}
};

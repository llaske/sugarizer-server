// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
*/

module.exports = function postLogin(req, res) {

	// reinit l10n with locale
	if (req.body && req.body.lang) {
		common.l10n.setLanguage(req.body.lang);
	}

	// validate
	req.assert('username', common.l10n.get('UsernameInvalid')).notEmpty();
	req.assert('password', common.l10n.get('PasswordBlank')).notEmpty();

	// get errors
	var errors = req.validationErrors();

	var role = ["admin", "teacher"];
	if (req.body.role == "teacher") {
		role = ["teacher"];
	} else if (req.body.role == "admin") {
		role = ["admin"];
	}

	//form data
	var form = {
		user: JSON.stringify({
			name: req.body.username,
			password: req.body.password,
			role: role
		})
	};
	
	//call
	if (!errors) {
		// call
		superagent
			.post(common.getAPIUrl(req) + 'auth/login')
			.set({
				"content-type": "application/json",
			})
			.send(form)
			.end(function (error, response) {
				if (response.statusCode == 200) {
					//store user and key in session
					req.session.user = response.body.token;
					if (response.body.fullAuth) { //fullAuth is true - user fully authenticated.
						/**
						 The user has either 2FA disabed or has not set it up yet, and is fully authenticated
						 so we redirect the user to dashboard
						 */
						return res.redirect('/dashboard'+(req.body && req.body.lang ? "?lang="+req.body.lang : ""));
					} else {
						/**
						 The user has enabled 2FA, and is not fully authenticated
						 so we redirect the user to verify2FA page
						 */
						return res.redirect('/dashboard/verify2FA');
					}
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+response.body.code)
					});
					return res.redirect('/dashboard/login');
				}
			});
	} else {
		req.flash('errors', errors);
		return res.redirect('/dashboard/login');
	}
};

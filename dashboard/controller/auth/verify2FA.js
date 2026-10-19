// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common'),
	validator = require('../../helper/validator'),
	auth = require('./index');

module.exports = async function verify2FA(req, res) {
	if (req.method == 'POST') {
		// validate
		await validator.run(req, [
			validator.check('tokenentry', {text: 'token-invalid'}).notEmpty()
		]);
    
		var otpToken = req.body.tokenentry;
		// get errors
		var errors = validator.errors(req);
    
		//to-do post request logic.
		if (!errors){
			superagent
				.post(common.getAPIUrl(req) + 'auth/verify2FA')
				.set(common.getHeaders(req))
				.send({
					userToken: otpToken
				})
				.end(function (error, response) {
                        
					req.session.user = response.body;
					if (response.statusCode == 200) {
    
						if (req.session.user.partial === false) { //verifiedUser is true - user fully authenticated.
							/**
                                 The user is fully authenticated
                                 so we redirect the user to dashboard
                                 */
							return res.redirect('/dashboard'+(req.body && req.body.lang ? "?lang="+req.body.lang : ""));
						} else {
							/**
                                 The user has enabled 2FA, and is not fully authenticated
                                 so we redirect the user to verify2FA page and show the error.
                                 */
							req.flash('errors', {
								msg: common.l10n.get('ErrorCode33')
							});
							return res.redirect('/dashboard/verify2FA');
						}
					}
				});
		} else {
			req.flash('errors', errors);
			return res.redirect('/dashboard/verify2FA');
		}
	} else {
		res.render('verify2FA', {
			module: 'verify2FA',
			server: auth.ini().information,
			account: req.session.user
		});
	}
};

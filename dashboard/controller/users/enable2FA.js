// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common'),
	regexValidate = require('../../helper/regexValidate'),
	qrCodeUtil = require('../../../api/controller/utils/qrCodeUtil');

var users = require('./index');
var min_token_size = 6;


module.exports = function enable2FA(req, res) {
	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.method == 'POST') {

		req.assert('tokenentry', common.l10n.get('TokenAtLeast', {min_token_size: min_token_size})).len(min_token_size);
		req.assert('tokenentry', common.l10n.get('TokenInvalid')).matches(regexValidate("tokenentry"));

		var otpToken = req.body.tokenentry;

		// get errors
		var errors = req.validationErrors();

		if (!errors){
			superagent
				.put(common.getAPIUrl(req) + 'api/v1/dashboard/profile/enable2FA')
				.set(common.getHeaders(req))
				.send({
					userToken: otpToken
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						req.flash('success', {
							msg: common.l10n.get('TotpEnabled')
						});
						return res.redirect('/dashboard/profile');
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode'+response.body.code)
						});
						return res.redirect('/dashboard/profile/enable2FA');
					}
				});
		} else {
			req.flash('errors', {
				msg: common.l10n.get('TokenInvalid')
			});
			return res.redirect('/dashboard/profile/enable2FA');
		}
	} else {
		superagent
			.get(common.getAPIUrl(req) + 'api/v1/dashboard/profile/enable2FA')
			.set(common.getHeaders(req))
			.end(function (error, response) {
				if (error) {
					req.flash('errors', {
						msg: common.l10n.get('ThereIsError')
					});
					return res.redirect('/dashboard/profile');
				} else if (response.statusCode == 200) {
					//get user, otpAUth and UniqueSecret Response from api.
					var user = response.body.user;
					var otpAuth = response.body.otpAuth;
					var uniqueSecret = response.body.uniqueSecret;

					//generate QR code then render page.
					qrCodeUtil.generateQRCode(otpAuth).then(function (result) {
						res.render('twoFactor', {
							module: 'twoFactor',
							mode: 'enabletotp',
							user: user,
							uniqueSecret: uniqueSecret,
							twoFactorqr: result.image,
							account: req.session.user,
							server: users.ini().information
						});
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+user.code)
					});
					return res.redirect('/dashboard/profile/enable2FA');
				}
			});
	}
};

var superagent = require('superagent'),
	common = require('../../helper/common');


module.exports = function disable2FA(req, res) {
	if (req.method == 'POST') {
		superagent
			.put(common.getAPIUrl(req) + 'api/v1/dashboard/profile/disable2FA')
			.set(common.getHeaders(req))
			.end(function (error, response) {
				if (response.statusCode == 200) {
					req.flash('success', {
						msg: common.l10n.get('TotpDisabled')
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+response.body.code)
					});
				}
				return res.redirect('/dashboard/profile');
			});
	} else {
		return res.redirect('/dashboard/profile');
	}
};

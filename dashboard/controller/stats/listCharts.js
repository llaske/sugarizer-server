// include libraries
var request = require('request'),
	common = require('../../helper/common');

var stats = require('./index');

// list charts page
module.exports = function listCharts(req, res) {

	// reinit l10n with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/charts'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// send to list charts page
			res.render('admin/listCharts', {
				module: 'stats',
				charts: body.charts,
				headers: common.getHeaders(req),
				account: req.session.user,
				url: common.getAPIUrl(req),
				server: stats.ini().information
			});

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/stats');
		}
	});
};

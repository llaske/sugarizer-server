// include libraries
var request = require('request'),
	common = require('../../helper/common'),
	fakeLaunch = require('./fakeLaunch'),
	launch = require('./launch');

// init settings
var ini=null;
exports.init = function (setting) {
	ini = setting;
};

// main landing page
exports.index = function(req, res) {

	// reinit l10n with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '+index',
			name: (req.query.search ? req.query.search.trim() : undefined)
		},
		uri: common.getAPIUrl(req) + 'api/v1/activities'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('admin/activities', {
				module: 'activities',
				activities: body,
				headers: common.getHeaders(req),
				account: req.session.user,
				url: common.getAPIUrl(req),
				search: (req.query.search ? req.query.search.trim() : ''),
				server: ini.information,
				role: req.role
			});

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/activities');
		}
	});
};

exports.fakeLaunch = fakeLaunch;
exports.launch = launch;

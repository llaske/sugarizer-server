// include libraries
var superagent = require('superagent'),
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

	var sort = '+index';
	if (req.query && req.query.sort) {
		sort = req.query.sort;
	}

	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/activities')
		.set(common.getHeaders(req))
		.query({
			sort: sort,
			name: (req.query.search ? req.query.search.trim() : undefined)
		})
		.end(function (error, response) {
			if (response.statusCode == 200) {

				// send to activities page
				res.render('activities', {
					module: 'activities',
					activities: response.body,
					headers: common.getHeaders(req),
					account: req.session.user,
					url: common.getAPIUrl(req),
					search: (req.query.search ? req.query.search.trim() : ''),
					server: ini.information
				});
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/activities');
			}
		});
};

exports.fakeLaunch = fakeLaunch;
exports.launch = launch;

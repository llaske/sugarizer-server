// include libraries
var request = require('request'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '+index',
			name: (req.query.search ? req.query.search.trim() : undefined)
		},
		uri: req.iniconfig.dashboard.api + 'api/v1/activities'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('activities', {
				module: 'activities',
				activities: body,
				headers: common.getHeaders(req),
				account: req.session.user,
				url: req.iniconfig.dashboard.api,
				search: (req.query.search ? req.query.search.trim() : ''),
				client_url: req.iniconfig.dashboard.client
			});

		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	})
};

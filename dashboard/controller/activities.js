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
		uri: req.iniconfig.web.api + 'api/v1/activities'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('activities', {
				module: 'activities',
				activities: body,
				headers: common.getHeaders(req),
				url: req.iniconfig.web.api,
				search: (req.query.search ? req.query.search.trim() : ''),
				client_url: req.iniconfig.web.client
			});

		} else {
			req.flash('errors', {
				msg: body.message
			});
		}
	})
};

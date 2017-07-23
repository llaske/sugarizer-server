// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	// send to login page
	res.render('stats', {
		title: 'stats',
		module: 'stats',
		account: req.session.user
	});
};

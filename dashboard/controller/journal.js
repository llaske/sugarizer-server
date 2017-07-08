// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {
	res.render('journal', {
		module: 'journal'
	});
};

// include libraries
var moment = require('moment'),
	getGraph = require('./getGraph');

// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

// main landing page
exports.index = function(req, res) {

	// reinit momemt with locale
	if (req.query && req.query.lang) {
		moment.locale(req.query.lang);
	}

	// send to login page
	res.render('stats', {
		title: 'stats',
		module: 'stats',
		account: req.session.user,
		server: ini.information
	});
};

exports.getGraph = getGraph;

// include libraries
var moment = require('moment'),
	common = require('../../helper/common'),
	deleteEntry = require('./deleteEntry'),
	getEntries = require('./getEntries');

// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

exports.ini = function() {
	return ini;
};

// main landing page
exports.index = function(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);
	
	res.render('journal', {
		module: 'journals',
		moment: moment,
		entries: [],
		query: {
			uid: -1,
			type: 'private'
		},
		user: undefined,
		account: req.session.user,
		server: ini.information
	});
};

exports.deleteEntry = deleteEntry;

exports.getEntries = getEntries;

// include libraries
var moment = require('moment'),
	common = require('../../helper/common'),
	deleteEntry = require('./deleteEntry'),
	getEntries = require('./getEntries');

var _util = require('./util'),
	getSharedJournalId = _util.getSharedJournalId;

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
	
	getSharedJournalId(req, res, function(shared) {
		res.render('journal', {
			module: 'journals',
			moment: moment,
			entries: [],
			query: {
				uid: -1,
				type: 'private'
			},
			user: undefined,
			shared: shared,
			account: req.session.user,
			server: ini.information
		});
	});
};

exports.deleteEntry = deleteEntry;

exports.getEntries = getEntries;

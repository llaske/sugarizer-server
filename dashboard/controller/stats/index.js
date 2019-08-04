// include libraries
var common = require('../../helper/common'),
	getGraph = require('./getGraph'),
	addChart = require('./addChart'),
	deleteChart = require('./deleteChart'),
	editChart = require('./editChart');

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

	// send to login page
	res.render('admin/stats', {
		title: 'stats',
		module: 'stats',
		account: req.session.user,
		server: ini.information
	});
};

exports.getGraph = getGraph;

exports.addChart = addChart;

exports.deleteChart = deleteChart;

exports.editChart = editChart;

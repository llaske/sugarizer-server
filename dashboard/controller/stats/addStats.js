// include libraries
var moment = require('moment'),
	common = require('../../helper/common'),
	chartList = require('./util/chartList')();

var stats = require('./index');

module.exports = function addstats(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	if (req.method == 'POST') {
		// lol
	} else {
		// send to stats page
		res.render('admin/addEditChart', {
			module: 'stats',
			moment: moment,
			charts: chartList,
			account: req.session.user,
			server: stats.ini().information
		});
	}
};

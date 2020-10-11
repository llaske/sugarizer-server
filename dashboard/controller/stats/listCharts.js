// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common'),
	chartList = require('./util/chartList')();

var stats = require('./index');

// list charts page
module.exports = function listCharts(req, res) {

	// reinit l10n with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
	}

	var chartDic = {};
	for (var i=0; i<chartList.length; i++) {
		chartDic[chartList[i].key] = chartList[i];
	}

	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/charts')
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {
				// send to list charts page
				res.render('admin/listCharts', {
					module: 'stats',
					charts: response.body.charts,
					headers: common.getHeaders(req),
					chartList: chartDic,
					account: req.session.user,
					url: common.getAPIUrl(req),
					server: stats.ini().information
				});
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
				return res.redirect('/dashboard/stats');
			}
		});
};

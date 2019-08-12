// include libraries
var request = require('request'),
	common = require('../../helper/common'),
	getGraph = require('./getGraph'),
	addChart = require('./addChart'),
	deleteChart = require('./deleteChart'),
	editChart = require('./editChart'),
	listCharts = require('./listCharts'),
	chartList = require('./util/chartList')();

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

	var chartDic = {};
	for (var i=0; i<chartList.length; i++) {
		chartDic[chartList[i].key] = chartList[i];
	}

	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			hidden: false,
		},
		uri: common.getAPIUrl(req) + 'api/v1/charts'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			res.render('admin/stats', {
				title: 'stats',
				module: 'stats',
				charts: body.charts,
				chartList: chartDic,
				account: req.session.user,
				server: ini.information
			});
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard');
		}
	});
};

exports.getGraph = getGraph;

exports.addChart = addChart;

exports.deleteChart = deleteChart;

exports.editChart = editChart;

exports.listCharts = listCharts;

//include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common');

var _util = require('../journal/util'),
	getActivities = _util.getActivities;

var assignment = require('./index');

// init settings
var ini = null;
exports.init = function (settings) {
	ini = settings;
};
exports.ini = function () {
	return ini;
};

module.exports = function getAllDeliveries(req, res) {
	common.reinitLocale(req);
	var query = {
		sort: '+buddy_name'
	};

	//get query params
	if (req.query.buddy_name != '') {
		query['buddy_name'] = req.query.buddy_name;
	}
	if (req.query.status != '') {
		query['Delivered'] = req.query.status;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	if (req.query.sort != '') {
		query['sort'] = req.query.sort;
	}

	getActivities(req, res, function (activities) {
		var iconMap = {};
		for (var i = 0; i < activities.length; i++) {
			iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
		}
		superagent
			.get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/' + req.params.assignmentId)
			.set(common.getHeaders(req))
			.query(query)
			.end(function (error, response) {
				if (response.statusCode == 200) {
					res.render('deliveries', {
						moment: moment,
						query: query,
						common: common,
						module: 'assignments',
						headers: common.getHeaders(req),
						server: assignment.ini().information,
						iconMap: iconMap,
						account: req.session.user,
						data: response.body,
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode' + response.body.code)
					});
				}
			});
	});
};

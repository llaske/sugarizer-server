//include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	addAssignment = require('./addAssignment'),
	deleteAssignment = require('./deleteAssignment'),
	editAssignment = require('./editAssignment'),
	getAllDeliveries = require('./getAllDeliveries'),
	launchAssignment = require('./launchAssignment'),
	addComment = require('./addComment'),
	returnAssignment = require('./returnAssignment');

var _util = require('../journal/util'),
	getActivities = _util.getActivities;

// init settings
var ini = null;
exports.init = function (settings) {
	ini = settings;
};

exports.ini = function () {
	return ini;
};

//main Loading page
exports.index = function (req, res) {
	// reinit l10n and momemt with locale
	common.reinitLocale(req);
	var query = {
		sort: '+name'
	};
	//get query params
	if (req.query.assignment != '') {
		query['name'] = req.query.assignment;
	}
	if (req.query.status != '') {
		query['isAssigned'] = req.query.status;
	}
	if (req.query.status == 'terminated') {
		query['terminated'] = req.query.status;
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
	if (req.session.user.user.role != 'admin') {
		query['created_by'] = req.session.user.user._id;
	}

	getActivities(req, res, function (activities) {
		var iconMap = {};
		for (var i = 0; i < activities.length; i++) {
			iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
		}
		superagent
			.get(common.getAPIUrl(req) + 'api/v1/assignments')
			.set(common.getHeaders(req))
			.query(query)
			.end(function (error, response) {
				if (response.statusCode == 200) {
					res.render('assignments', {
						moment: moment,
						common: common,
						query: query,
						module: 'assignments',
						headers: common.getHeaders(req),
						server: ini.information,
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

exports.addAssignment = addAssignment;
exports.deleteAssignment = deleteAssignment;
exports.editAssignment = editAssignment;
exports.getAllDeliveries = getAllDeliveries;
exports.launchAssignment = launchAssignment;
exports.addComment = addComment;
exports.returnAssignment = returnAssignment;

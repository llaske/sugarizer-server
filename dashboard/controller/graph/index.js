// include utilities
var _util = require('./util'),
	getTopContributors = _util.getTopContributors,
	getTopActivities = _util.getTopActivities,
	getRecentUsers = _util.getRecentUsers,
	getRecentActivities = _util.getRecentActivities,
	averageEntries = _util.averageEntries;

exports.getGraph = function(req, res) {

	if (req.query.type == 'top-contributor') {
		getTopContributors(req, res);
	}
	if (req.query.type == 'top-activities') {
		getTopActivities(req, res);
	}
	if (req.query.type == 'recent-users') {
		getRecentUsers(req, res);
	}
	if (req.query.type == 'recent-activities') {
		getRecentActivities(req, res);
	}
};


exports.getAverageEntries = function() {
	console.log('getAverageEntries', averageEntries());
	return averageEntries();
};

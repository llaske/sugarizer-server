// include utilities
var _util = require('./util'),
	getTopContributors = _util.getTopContributors,
	getTopActivities = _util.getTopActivities,
	getRecentStudents = _util.getRecentStudents,
	getRecentTeachers = _util.getRecentTeachers,
	getRecentAdmins = _util.getRecentAdmins,
	getRecentActivities = _util.getRecentActivities,
	averageEntries = _util.averageEntries;

exports.getGraph = function(req, res) {

	if (req.query.type == 'top-contributor') {
		getTopContributors(req, res);
	}
	if (req.query.type == 'top-activities') {
		getTopActivities(req, res);
	}
	if (req.query.type == 'recent-students') {
		getRecentStudents(req, res);
	}
	if (req.query.type == 'recent-teachers') {
		getRecentTeachers(req, res);
	}
	if (req.query.type == 'recent-admins') {
		getRecentAdmins(req, res);
	}
	if (req.query.type == 'recent-activities') {
		getRecentActivities(req, res);
	}
};


exports.getAverageEntries = function() {
	return averageEntries();
};

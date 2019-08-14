// include libraries
var _util = require('./util'),
	getHowUserLaunchActivity = _util.getHowUserLaunchActivity,
	getHowOftenUserChangeSettings = _util.getHowOftenUserChangeSettings,
	getHowUsersAreActive = _util.getHowUsersAreActive,
	getWhatTypeOfClientConnected = _util.getWhatTypeOfClientConnected,
	getHowManyEntriesByJournal = _util.getHowManyEntriesByJournal,
	getLastWeekActiveUsers = _util.getLastWeekActiveUsers,
	getLastMonthActiveUsers = _util.getLastMonthActiveUsers,
	getLastYearActiveUsers = _util.getLastYearActiveUsers,
	getMostActiveClassrooms = _util.getMostActiveClassrooms;

module.exports = function getGraph(req, res) {
	if (req.query.type == 'how-user-launch-activities') {
		getHowUserLaunchActivity(req, res);
	} else if (req.query.type == 'how-often-user-change-settings') {
		getHowOftenUserChangeSettings(req, res);
	} else if (req.query.type == 'how-users-are-active') {
		getHowUsersAreActive(req, res);
	} else if (req.query.type == 'what-type-of-client-connected') {
		getWhatTypeOfClientConnected(req, res);
	} else if (req.query.type == 'how-many-entries-by-journal') {
		getHowManyEntriesByJournal(req, res);
	} else if (req.query.type == 'how-many-users-active-last-week') {
		getLastWeekActiveUsers(req, res);
	} else if (req.query.type == 'how-many-users-active-last-month') {
		getLastMonthActiveUsers(req, res);
	} else if (req.query.type == 'how-many-users-active-last-year') {
		getLastYearActiveUsers(req, res);
	} else if (req.query.type == 'most-active-classrooms') {
		getMostActiveClassrooms(req, res);
	}
};

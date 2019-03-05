// include libraries
var _util = require('./util'),
	getHowUserLaunchActivity = _util.getHowUserLaunchActivity,
	getHowOftenUserChangeSettings = _util.getHowOftenUserChangeSettings,
	getHowUsersAreActive = _util.getHowUsersAreActive,
	getWhatTypeOfClientConnected = _util.getWhatTypeOfClientConnected,
	getHowManyEntriesByJournal = _util.getHowManyEntriesByJournal;


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
	}
};

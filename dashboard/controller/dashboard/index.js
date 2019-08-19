// include libraries
var common = require('../../helper/common');

var _util = require('./util'),
	getAllJournals = _util.getAllJournals,
	getAllActivities = _util.getAllActivities,
	getAllUsers = _util.getAllUsers,
	getAllClassrooms = _util.getAllClassrooms;


// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

// main landing page
exports.index = function(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	var data = {};

	//get all users
	getAllUsers(req, res, function(usersResponse) {

		// store
		data.users = usersResponse;

		//get all activities
		getAllActivities(req, res, function(activitiesResponse) {

			// store
			data.activities = activitiesResponse;

			//get journal data
			getAllJournals(req, res, function(journalResponse) {

				//process
				var d = {};
				d.totalJournal = journalResponse.length;
				d.totalEntries = 0;
				for (var i = 0; i < journalResponse.length; i++) {
					d.totalEntries += journalResponse[i].count;
				}

				//store
				data.journal = d;

				//get all classrooms
				getAllClassrooms(req, res, function(classroomResponse) {
					
					//store
					data.classrooms = classroomResponse;

					// send to login page
					res.render('dashboard', {
						title: 'dashboard',
						module: 'dashboard',
						data: data,
						account: req.session.user,
						server: ini.information
					});
				});
			});
		});
	});
};

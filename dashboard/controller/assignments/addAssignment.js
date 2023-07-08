//include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors'),
	emoji = require('../../public/js/emoji'),
	dashboard_utils = require('../dashboard/util'),
	journal_utils = require('../journal/util/index');

var assignment = require('./index');

module.exports = function addAssignment(req, res) {
	// reinit l10n and momemt with locale
	common.reinitLocale(req);
	var query = {
		limit: (req.query.limit ? req.query.limit : 10),
		sort: (req.query.sort ? req.query.sort : '-timestamp'),
		offset: (req.query.offset ? req.query.offset : 0)
	};
	if (req.session.user) {
		query['journal'] = req.session.user.user.private_journal;
	}
	if (req.query.uid) {
		query['uid'] = req.query.uid;
		query['type'] = "private";
	} else {
		query['type'] = "shared";
	}
	if (req.method == 'POST') {
		// validate
		if (!req.body.assignedWork || !req.body.assignedWork.length) {
			req.assert('assignedWork', common.l10n.get('InvalidAid')).equals(null);
		}
		req.body.name = req.body.name.trim();
		req.body.classrooms = req.body.classrooms || [];
		if (typeof req.body.classrooms == 'string') {
			req.body.classrooms = [req.body.classrooms];
		}
		if (!req.body.lateTurnIn) {
			req.body.lateTurnIn = false;
		} else {
			req.body.lateTurnIn = true;
		}
		//join date and time
		if (!req.body.dueDate || !req.body.time) {
			req.assert('dueDate', common.l10n.get('InvalidDueDate')).equals(null);
		}
		//check if due date is in the past
		var computedDate = parseInt(req.body.dueTimestamp)+parseInt(req.body.dueDatestamp);
		if (req.body.dueDate && computedDate < Date.now()) {
			req.assert('dueDate', common.l10n.get('InvalidDueDate')).equals(req.body.dueDate);
		}
		req.body.dueDate = computedDate;
		delete req.body.dueTimestamp;
		delete req.body.dueDatestamp;
        
		//delete time
		if (req.body.time) {
			delete req.body.time;
		}
		req.assert('name', common.l10n.get('AssignmentNameInvalid')).matches(/^[a-z0-9 ]+$/i);
		req.body.options = { sync: true, stats: true };
		// get errors
		var errors = req.validationErrors();

		// call
		if (!errors) {
			superagent
				.post(common.getAPIUrl(req) + 'api/v1/assignments')
				.set(common.getHeaders(req))
				.send({
					assignment: JSON.stringify(req.body)
				})
				.end(function (error, response) {
					if (response.statusCode == 200) {
						// send to classrooms page
						req.flash('success', {
							msg: common.l10n.get('AssignmentCreated', { name: req.body.name })
						});
						return res.redirect('/dashboard/assignments/');
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode' + response.body.code)
						});
						return res.redirect('/dashboard/assignments/add');
					}
				});
		} else {
			dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
				journal_utils.getJournalEntries(req, res, query, function (journalEntries) {
					journal_utils.getActivities(req, res, function (activities) {
						//make iconMap
						var iconMap = {};
						for (var i = 0; i < activities.length; i++) {
							iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
						}
						if (req.body.classrooms && typeof (req.body.classrooms) == "object" && req.body.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
							for (var i = 0; i < classrooms.classrooms.length; i++) {
								if (req.body.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
									classrooms.classrooms[i]['is_member'] = true;
								}
							}
						}
						req.flash('errors', errors);
						return res.render('addEditAssignment', {
							mode: "add",
							module: 'assignments',
							xocolors: xocolors,
							assignment: {
								name: req.body.name,
								instructions: req.body.instructions,
								dueDate: req.body.dueDate,
								lateTurnIn: req.body.lateTurnIn,
							},
							emoji: emoji,
							common: common,
							moment: moment,
							entries: journalEntries.entries,
							classrooms: classrooms.classrooms,
							iconMap: iconMap,
							account: req.session.user,
							server: assignment.ini().information
						});
					});
				});
			});
		}
	} else {
		// send back
		dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
			journal_utils.getJournalEntries(req, res, query, function (journalEntries) {
				journal_utils.getActivities(req, res, function (activities) {
					//make hashlist
					var iconMap = {};
					for (var i = 0; i < activities.length; i++) {
						iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
					}
					res.render('addEditAssignment', {
						mode: "add",
						module: 'assignments',
						classrooms: classrooms.classrooms,
						xocolors: xocolors,
						emoji: emoji,
						entries: journalEntries.entries,
						iconMap: iconMap,
						common: common,
						moment: moment,
						account: req.session.user,
						server: assignment.ini().information
					});
				});
			});
		});
	}
};

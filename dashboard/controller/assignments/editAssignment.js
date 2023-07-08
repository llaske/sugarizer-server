//include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors')(),
	emoji = require('../../public/js/emoji'),
	dashboard_utils = require('../dashboard/util'),
	journal_utils = require('../journal/util/index');

var assignments = require('./index');

module.exports = function editAssignment(req, res) {
	// reinit l10n and momemt with locale
	common.reinitLocale(req);
	if (req.params.assignmentId) {
		if (req.method == 'POST') {
			// validate
			req.body.name = req.body.name.trim();
			req.body.classrooms = req.body.classrooms || [];
			if (typeof req.body.classrooms == 'string') {
				req.body.classrooms = [req.body.classrooms];
			}
			//join dueDate and time
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

			//delete req.body.time
			if (req.body.time) {
				delete req.body.time;
			}
			req.assert('name', common.l10n.get('AssignmentNameInvalid')).matches(/^[a-z0-9 ]+$/i);
			req.assert('instructions', common.l10n.get('AssignmentInstructionsInvalid')).matches(/^[\s\S]*$/i);

			// get errors
			var errors = req.validationErrors();
			//call
			if (!errors) {
				superagent
					.put(common.getAPIUrl(req) + 'api/v1/assignments/' + req.params.assignmentId)
					.set(common.getHeaders(req))
					.send({
						assignment: JSON.stringify(req.body)
					})
					.end(function (error, response) {
						if (response.statusCode == 200) {
							// send back
							req.flash('success', {
								msg: common.l10n.get('AssignmentUpdated', { name: req.body.name })
							});
							return res.redirect('/dashboard/assignments/');
						} else {
							req.flash('errors', {
								msg: common.l10n.get('ErrorCode' + response.body.code)
							});
							return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
						}
					});
			} else {
				req.flash('errors', errors);
				return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
			}
		} else {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/assignments/' + req.params.assignmentId)
				.set(common.getHeaders(req))
				.end(function (error, response) {
					if (response.statusCode == 200) {
						var assignment = response.body;

						dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
							journal_utils.getActivities(req, res, function (activities) {
								//make iconMap
								var iconMap = {};
								for (var i = 0; i < activities.length; i++) {
									iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
								}
                                                            
								if (assignment.classrooms && typeof (assignment.classrooms) == "object" && assignment.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
									for (var i = 0; i < assignment.classrooms.length; i++) {
										for (var j = 0; j < classrooms.classrooms.length; j++) {
											if (assignment.classrooms[i]._id == classrooms.classrooms[j]._id) {
												classrooms.classrooms[j]["is_member"] = true;
											}
										}
									}
								}
								// send back
								res.render('addEditAssignment', {
									module: 'assignments',
									name: "Assignments",
									mode: "edit",
									assignment: response.body,
									classrooms: classrooms.classrooms,
									common: common,
									moment: moment,
									xocolors: xocolors,
									emoji: emoji,
									iconMap: iconMap,
									account: req.session.user,
									server: assignments.ini().information
								});
							});
						});
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode' + response.body.code)
						});
						return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
					}
				});
		}
	}
};

// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports =  function exportCSV(req, res) {
	var assignment = [];
	var Classrooms = {};
	async.series([
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/assignments')
				.set(common.getHeaders(req))
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body && typeof response.body.assignments == "object" && response.body.assignments.length > 0) {
							for (var i=0; i<response.body.assignments.length; i++) {
								assignment[response.body.assignments[i]._id] = {
									name: response.body.assignments[i].name,
									students: response.body.assignments[i].assignedWork
								};
								if (i == response.body.assignments.length - 1) callback(null);
							}
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				});
		}
	], function() {
		res.json({success: true, msg: common.l10n.get('ExportSuccess'), data: assignment});
		// if (assignment.length == 0) {
		// 	res.json({success: false, msg: common.l10n.get('NoAssignmentFound')});
		// } else {
		// }
		return;
	});
};

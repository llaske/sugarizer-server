// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportCSV(req, res) {
	var assignment = [];
	var Classrooms = {};
	async.series([
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/assignments')
				.set(common.getHeaders(req))
				.end(function (error, response) {
					if (response.statusCode == 200) {
						if (response.body && typeof response.body.classrooms == "object" && response.body.classrooms.length > 0) {
							for (var i=0; i<response.body.classrooms.length; i++) {
								Classrooms[response.body.classrooms[i]._id] = {
									name: response.body.classrooms[i].name,
									students: response.body.classrooms[i].students
								};
								if (i == response.body.classrooms.length - 1) callback(null);
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
		if (assignment.length == 0) {
			res.json({success: false, msg: common.l10n.get('NoAssignmentFound')});
		} else {
			res.json({success: true, msg: common.l10n.get('ExportSuccess'), data: assignment});
		}
		return;
	});
};

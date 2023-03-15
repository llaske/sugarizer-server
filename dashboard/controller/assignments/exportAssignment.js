// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportAssignment(req, res) {
	var resultAssignment = [];
	var status = req.query.status;
	var user = req.query.user;
	var q = {};
	if (status) q['Delivered'] = status === 'true' ? true : false ;
	if (user) {
		q['buddy_name'] = user;
	}
	function validateDelivery(assignmentCheck) {
		var assign = {
			_id: '',
			title: '',     //metadata.title
			status: '',    //metadata.status
			comment: '',   //metadata.comment
			activity:'',  //metadata.activity
			isSubmitted:'',  //metadata.isSubmitted
		};
		if (assignmentCheck._id) {
			assign._id = assignmentCheck._id;
		}
		if (assignmentCheck.content[0].metadata.title) {
			assign.title = assignmentCheck.content[0].metadata.title;
		}
		if (assignmentCheck.content[0].metadata.status) {
			assign.status = assignmentCheck.content[0].metadata.status;
		}
		if (assignmentCheck.content[0].metadata.comment) {
			assign.comment = assignmentCheck.content[0].metadata.comment;
		}
		if (assignmentCheck.content[0].metadata.activity) {
			assign.activity = assignmentCheck.content[0].metadata.activity;
		}
		if (assignmentCheck.content[0].metadata.isSubmitted) {
			assign.isSubmitted = assignmentCheck.content[0].metadata.isSubmitted;
		}
		return assign;
	}
	
	async.series([
		function (callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/' + req.params.assignmentId)
				.set(common.getHeaders(req))
				.query(q)
				.end(function (error, response) {
					if (response.statusCode == 200) {
						for(var i=0;i<response.body.deliveries.length;i++){
							resultAssignment.push(validateDelivery(response.body.deliveries[i]));
						}
						callback(resultAssignment);
					} else {
						callback(null);
					}
				});
		}
	], function () {
		if (resultAssignment.length == 0) {
			res.json({ success: false, msg: common.l10n.get('NoAssignmentFound') });
		} else {
			res.json({ success: true, msg: common.l10n.get('ExportSuccessDeliveries'), data: resultAssignment });
		}
		return;
	});
};

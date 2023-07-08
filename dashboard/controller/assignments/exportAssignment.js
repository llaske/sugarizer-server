// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

module.exports = function exportAssignment(req, res) {
	var resultAssignments = [];
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
			title: '',             //metadata.title
			name: '',              //metadata.buddy_name
			status: 'Expected',    //metadata.status
			deliveryDate: '',      //metadata.submissionDate
			score: '',	           //metadata.score
			comment: '',           //metadata.comment
			activity:'',           //metadata.activity
			isSubmitted:'',        //metadata.isSubmitted
		};
		if (assignmentCheck._id) {
			assign._id = assignmentCheck._id;
		}
		if (assignmentCheck.content[0].metadata.title) {
			assign.title = assignmentCheck.content[0].metadata.title;
		}
		if (assignmentCheck.content[0].metadata.buddy_name) {
			assign.name = assignmentCheck.content[0].metadata.buddy_name;
		}
		if (assignmentCheck.content[0].metadata.status) {
			assign.status = assignmentCheck.content[0].metadata.status;
		}
		if (assignmentCheck.content[0].metadata.submissionDate) {
			assign.deliveryDate = new Date(assignmentCheck.content[0].metadata.submissionDate).toLocaleString();
		}
		if (assignmentCheck.content[0].metadata.score) {
			assign.score = assignmentCheck.content[0].metadata.score;
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
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/' + req.params.assignmentId)
		.set(common.getHeaders(req))
		.query(q)
		.end(function (error, response) {
			if (response.statusCode == 200) {
				for(var i=0;i<response.body.deliveries.length;i++){
					resultAssignments.push(validateDelivery(response.body.deliveries[i]));
				}

				if (resultAssignments.length == 0) {
					res.json({ success: false, msg: common.l10n.get('NoDeliveriesFound') });
				} else {
					res.json({ success: true, msg: common.l10n.get('ExportSuccessDeliveries'), data: resultAssignments });
				}
			} else {
				res.json({ success: false, msg: common.l10n.get('ErrorCode10') });
			}
		});
};

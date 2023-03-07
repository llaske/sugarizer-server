// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportAssignment(req, res) {
	let resultAssignment = [];
	const { status, user } = req.query;
	let q = {};
	if (status) q = { Delivered: status === 'true' ? true : false };
	if (user) {
		q= {
			...q,
			buddy_name: user,
		};
	}
	function validateDelivery(assignmentCheck) {
		const assign = {
			_id: '',
			title: '',     //metadata.title
			status: '',    //metadata.status
			comment: '',   //metadata.comment
			activity:'',  //metadata.activity    //metadata.timestamp
			isSubmitted:'',  //metadata.isSubmitted
		}
		if (assignmentCheck._id) {
			assign._id = assignmentCheck._id;
		}
		if (assignmentCheck.content[0]?.metadata?.title) {
			assign.title = assignmentCheck.content[0].metadata.title;
		}
		if (assignmentCheck.content[0]?.metadata?.status) {
			assign.status = assignmentCheck.content[0].metadata.status;
		}
		if (assignmentCheck.content[0]?.metadata?.comment) {
			assign.comment = assignmentCheck.content[0].metadata.comment;
		}
		if (assignmentCheck.content[0]?.metadata?.activity) {
			assign.activity = assignmentCheck.content[0].metadata.activity;
		}
		if (assignmentCheck.content[0]?.metadata?.isSubmitted) {
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
					console.log('export');
					console.log(response.body);
					if (response.statusCode == 200) {
						response.body.deliveries.map((delivery) => {
							resultAssignment.push(validateDelivery(delivery));
						});
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
			res.json({ success: true, msg: common.l10n.get('ExportSuccess'), data: resultAssignment });
		}
		return;
	});
};

// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports =  function exportCSV(req, res) {
	var assignment = [];

	const validateAssignment=(assignment)=>{
		const assign={
			_id:"",
			name:"",
			title:"",
			activity:"",
			creation_time:"",
			instruction:"",
			dueDate:"",
			classroom:"",
			isAssigned: ""
		};
		if(assignment._id){
			assign._id=assignment._id;
		}
		if(assignment.name){
			assign.name=assignment.name;
		}
		const assignedWork=assignment.assignedWork?.metadata;
		if(assignedWork?.title){
			assign.title=assignedWork.title;
		}
		if(assignedWork?.activity){
			assign.activity=assignedWork.activity;
		}
		if(assignedWork?.creation_time){
			assign.creation_time=new Date(assignedWork.creation_time);
		}
		if(assignment.instructions){
			assign.instruction=assignment.instructions;
		}
		if(assignment.dueDate){
			assign.dueDate=new Date(assignment.dueDate);
		}
		if(assignment.classrooms){
			assign.classroom='';
			for(var i=0;i<assignment.classrooms.length;i++){
				assign.classroom += assignment.classrooms[i]+(i!=assignment.classrooms.length-1?',':'');
			}
		}
		if(assignment.isAssigned){
			assign.isAssigned=assignment.isAssigned;
		}
		return assign;

	}
	async.series([
		function(callback) {
			superagent
				.get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/')
				.set(common.getHeaders(req))
				.end(function (error, response) {
					// console.log(response.body);
					if (response.statusCode == 200) {
						if (response.body && typeof response.body.assignments == "object" && response.body.assignments.length > 0) {
							for (var i=0; i<response.body.assignments.length; i++) {
								assignment.push(validateAssignment(response.body.assignments[i]));
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
		if (assignment.length == 0) {
			res.json({success: false, msg: common.l10n.get('NoAssignmentFound')});
		} else {
			res.json({success: true, msg: common.l10n.get('Assignment Export Success'), data: assignment});
		}
		return;
	});
};

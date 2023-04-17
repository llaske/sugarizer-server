// include libraries
var superagent = require('superagent'),
	common = require('../../../helper/common');


exports.getAllJournals = function(req, res, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/journal')
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {

				//callback
				callback(response.body);
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

exports.getAllActivities = function(req, res, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/activities')
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {

				//callback
				callback(response.body);
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

exports.getAllUsers = function(req, res, callback) {
	var role = req.query.role || 'student';
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/users')
		.set(common.getHeaders(req))
		.query({
			role: role,
			sort: '-timestamp',
			limit: 100000000
		})
		.end(function (error, response) {
			if (response.statusCode == 200) {
				//callback
				callback(response.body);
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

exports.getAllClassrooms = function(req, res, callback) {
	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/classrooms')
		.set(common.getHeaders(req))
		.end(function (error, response) {
			if (response.statusCode == 200) {

				//callback
				callback(response.body);
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

exports.getAllAssignments = function(req,res,callback){
	//call
	superagent
		.get(common.getAPIUrl(req)+'api/v1/assignments/deliveries')
		.set(common.getHeaders(req))
		.query(req.query)
		.end(function (error,response){
			if(response.statusCode == 200) {
			//callback
				callback(response.body);
			} else {
				req.flash('errors',{
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

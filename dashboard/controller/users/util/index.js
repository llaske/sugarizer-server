// include libraries
var request = require('request'),
	common = require('../../../helper/common');

// private function
exports.getClassrooms = function (req, callback){
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			limit: 100000 // get all possible classes
		},
		uri: common.getAPIUrl(req) + 'api/v1/classrooms'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// return list of classrooms 
			callback(body.classrooms); 
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

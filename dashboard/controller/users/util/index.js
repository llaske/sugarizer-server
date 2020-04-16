// include libraries
var superagent = require('superagent'),
	common = require('../../../helper/common');

// private function
exports.getClassrooms = function(req, callback) {
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/classrooms')
		.set(common.getHeaders(req))
		.query({
			limit: 100000 // get all possible classes
		})
		.end(function (error, response) {
			if (response.statusCode == 200) {

				// return list of classrooms
				callback(response.body.classrooms);
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

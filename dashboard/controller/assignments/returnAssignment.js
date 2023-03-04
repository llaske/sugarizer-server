//include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

module.exports = function returnAssignment(req, res) {
	var query = {
		oid: req.query.oid,
	};
	if (req.params.assignmentId) {
		var name = req.query.name || 'assignment';
		superagent
			.put(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/return/' + req.params.assignmentId)
			.set(common.getHeaders(req))
			.query(query)
			.end(function (error, response) {
				if (response.statusCode == 200) {
					// send to deliveries page
					req.flash('success', {
						msg: common.l10n.get('AssignmentReturned', { name: name })
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode' + response.body.code)
					});
				}
				return res.redirect('/dashboard/assignments/deliveries/' + req.params.assignmentId);
			});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/assignments');
	}
};

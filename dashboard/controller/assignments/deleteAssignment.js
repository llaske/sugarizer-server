//include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

module.exports = function deleteAssignment(req, res) {
	if (req.params.assignmentId) {
		var name = req.query.name || 'assignment';
		superagent
			.delete(common.getAPIUrl(req) + 'api/v1/assignments/' + req.params.assignmentId)
			.set(common.getHeaders(req))
			.end(function (error, response) {
				if (response.statusCode == 200) {
					// send to assignments page
					req.flash('success', {
						msg: common.l10n.get('AssignmentDeleted', { name: name })
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode' + response.body.code)
					});
				}
				return res.redirect('/dashboard/assignments');
			});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/assignments');
	}
};

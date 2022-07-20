// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

module.exports = function deleteClassroom(req, res) {

	if (req.params.classid) {
		var name = req.query.name || 'classroom';
		superagent
			.delete(common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid)
			.set(common.getHeaders(req))
			.end(function (error, response) {
				if (response.statusCode == 200) {

					// send to classrooms page
					req.flash('success', {
						msg: common.l10n.get('ClassroomDeleted', { name: name })
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode' + response.body.code)
					});
				}
				return res.redirect('/dashboard/classrooms');
			});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/classrooms');
	}
};

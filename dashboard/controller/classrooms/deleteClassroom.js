// include libraries
var request = require('request'),
	common = require('../../helper/common');

module.exports = function deleteClassroom(req, res) {

	if (req.params.classid) {
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/classrooms/' + req.params.classid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to classrooms page
				req.flash('success', {
					msg: common.l10n.get('ClassroomDeleted')
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+body.code)
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

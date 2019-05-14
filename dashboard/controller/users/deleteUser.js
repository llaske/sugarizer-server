// include libraries
var request = require('request'),
	common = require('../../helper/common');

module.exports = function deleteUser(req, res) {

	if (req.params.uid) {
		var role = req.query.role || 'student';
		var name = req.query.name || 'user';
		if (req.params.uid == common.getHeaders(req)['x-key']) {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode20')
			});
			return res.redirect('/dashboard/users/?role='+role);
		}
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/users/' + req.params.uid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to users page
				req.flash('success', {
					msg: common.l10n.get('UserDeleted', {name: name})
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+body.code)
				});
			}
			return res.redirect('/dashboard/users?role='+role);
		});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/users');
	}
};

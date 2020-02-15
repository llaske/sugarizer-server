// include libraries
var request = require('request'),
	common = require('../../helper/common');

// delete entry
module.exports = function deleteEntry(req, res) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'DELETE',
		qs: {
			oid: req.params.oid,
			type: 'partial'
		},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + req.params.jid
	}, function(error, response, body) {
		if (req.query.uid == undefined) {
			req.query.uid = "";
		}
		if (response.statusCode == 200) {
			// return back
			req.flash('success', {
				msg: common.l10n.get('EntryDeleted', {activity: req.query.title})
			});
			return res.redirect('/dashboard/journal/' + req.params.jid + '?uid=' + req.query.uid + '&offset=' + (req.query.offset ? req.query.offset : 0) + '&limit=' + (req.query.limit ? req.query.limit : 10));

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/journal/' + req.params.jid + '?uid=' + req.query.uid + '&offset=' + (req.query.offset ? req.query.offset : 0) + '&limit=' + (req.query.limit ? req.query.limit : 10));
		}
	});
};

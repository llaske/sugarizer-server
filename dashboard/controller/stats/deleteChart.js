// include libraries
var request = require('request'),
	common = require('../../helper/common');

module.exports = function deleteChart(req, res) {

	if (req.params.chartid) {
		var title = req.query.title || 'chart';
		request({
			headers: common.getHeaders(req),
			json: true,
			method: 'delete',
			uri: common.getAPIUrl(req) + 'api/v1/charts/' + req.params.chartid
		}, function(error, response, body) {
			if (response.statusCode == 200) {

				// send to charts page
				req.flash('success', {
					msg: common.l10n.get('ChartDeleted', {title: title})
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+body.code)
				});
			}
			return res.redirect('/dashboard/stats/list');
		});
	} else {
		req.flash('errors', {
			msg: common.l10n.get('ThereIsError')
		});
		return res.redirect('/dashboard/stats/list');
	}
};

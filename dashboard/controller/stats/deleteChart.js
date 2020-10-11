// include libraries
var superagent = require('superagent'),
	common = require('../../helper/common');

module.exports = function deleteChart(req, res) {

	if (req.params.chartid) {
		var title = req.query.title || 'chart';
		superagent
			.delete(common.getAPIUrl(req) + 'api/v1/charts/' + req.params.chartid)
			.set(common.getHeaders(req))
			.end(function (error, response) {
				if (response.statusCode == 200) {

					// send to charts page
					req.flash('success', {
						msg: common.l10n.get('ChartDeleted', {title: title})
					});
				} else {
					req.flash('errors', {
						msg: common.l10n.get('ErrorCode'+response.body.code)
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

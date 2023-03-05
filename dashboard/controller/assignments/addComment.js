//include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	xocolors = require('../../helper/xocolors');

var assignment = require('./index');

module.exports = function addComment(req, res) {

	//reinit l10n and momemt with locale
	common.reinitLocale(req);
	var query = {
		oid: req.query.oid,
	};

	if (req.method == 'POST') {
		// validate 
		req.body.comment = req.body.comment.trim();
		// get errors
		var errors = req.validationErrors();

		if (!errors) {
			superagent
				.put(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/comment/' + req.params.assignmentId)
				.set(common.getHeaders(req))
				.query(query)
				.send({
					comment: JSON.stringify(req.body),
				})
				.end(function (err, response) {
					if (response.statusCode == 200) {
						// send to deliveries page
						req.flash('success', {
							msg: common.l10n.get('CommentAdded', { comment: req.body.comment })
						});
						return res.redirect('/dashboard/assignments/deliveries/' + req.params.assignmentId);
					} else {
						req.flash('errors', {
							msg: common.l10n.get('ErrorCode' + response.body.code)
						});
						return res.redirect('/dashboard/assignments/deliveries/' + req.params.assignmentId);
					}
				});
		} else {
			req.flash('errors', errors);
			return res.redirect('/dashboard/assignments/deliveries/' + req.params.assignmentId);
		}
	} else {
		// send to deliveries page
		res.render('addComment', {
			mode: "add",
			module: 'assignments',
			headers: common.getHeaders(req),
			assignmentId: req.params.assignmentId,
			xocolors: xocolors,
			moment: moment,
			account: req.session.user,
			server: assignment.ini().information
		});
	}
};

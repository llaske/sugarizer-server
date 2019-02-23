/**
 * validate session for dashboard
 */
exports.validateSession = function(req, res, next) {
	if (!req.session.user) {
		res.redirect('/dashboard/login');
	}
	next();
};

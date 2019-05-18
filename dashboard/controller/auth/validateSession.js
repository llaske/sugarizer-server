/**
 * validate session for dashboard
 */
module.exports = function validateSession(req, res, next) {
	if (!req.session.user) {
		return res.redirect('/dashboard/login');
	}
	next();
};

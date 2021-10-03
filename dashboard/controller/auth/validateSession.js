/**
 * validate session for dashboard
 */
module.exports = function validateSession(req, res, next) {
	if (!req.session.user) {
		return res.redirect('/dashboard/login');
	}
	if (req.session.user.partial === true){
		return res.redirect('/dashboard/verify2FA');
	} else if (req.session.user.partial === false && req.session.user.user && req.session.user.user.role) {
		req.role = req.session.user.user.role;
		next();
	} else {
		return res.redirect('/dashboard/login');
	}
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
	req.session.destroy();
	res.redirect('/dashboard/login');
};
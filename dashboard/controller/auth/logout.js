/**
 * GET /logout
 * Log out.
*/

module.exports = function logout(req, res) {
	req.session.destroy();
	res.redirect('/dashboard/login');
};

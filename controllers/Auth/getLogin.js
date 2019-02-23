/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
	if (req.session.user) {
		// send to dashboard
		return res.redirect('/dashboard');
	} else {
		// send to login page
		res.render('login', {
			title: 'Login',
			server: ini.information
		});
	}
};

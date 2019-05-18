var auth = require('./index');

/**
 * GET /login
 * Login page.
*/

module.exports = function getLogin(req, res) {
	if (req.session.user) {
		// send to dashboard
		return res.redirect('/dashboard');
	} else {
		// send to login page
		res.render('login', {
			title: 'Login',
			server: auth.ini().information
		});
	}
};

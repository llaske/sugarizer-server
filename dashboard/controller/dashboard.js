// main landing page
exports.index = function(req, res) {
	// send to login page
	res.render('dashboard', {
		title: 'dashboard',
		module: 'dashboard',
		account: req.session.user
	});
};

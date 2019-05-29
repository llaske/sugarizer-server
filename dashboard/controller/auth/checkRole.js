module.exports = function checkRole(adminRoute, teacherRoute) {
	return function(req, res, next){
		if (req.session && req.session.user && req.session.user.user) {
			if (req.session.user.user.role == "admin") {
				adminRoute(req, res, next);
			} else if (req.session.user.user.role == "teacher") {
				teacherRoute(req, res, next);
			} else {
				res.redirect('/dashboard/login');
			}
		} else {
			res.redirect('/dashboard/login');
		}
	};
};

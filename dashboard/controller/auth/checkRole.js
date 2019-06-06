module.exports = function checkRole(adminRoute, teacherRoute) {
	return function(req, res, next){
		if (req.session && req.session.user && req.session.user.user) {
			if (req.session.user.user.role == "admin") {
				adminRoute(req, res, next);
			} else if (req.session.user.user.role == "teacher") {
				if (!teacherRoute) {
					return res.render('404', {
						"message": "Route Not Found!",
						"url": req.protocol + '://' + req.get('host') + req.originalUrl
					});
				}
				teacherRoute(req, res, next);
			} else {
				res.redirect('/dashboard/login');
			}
		} else {
			res.redirect('/dashboard/login');
		}
	};
};

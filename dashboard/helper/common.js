var ini = null;

exports.init = function(settings) {
	ini = settings;
}

exports.getHeaders = function(req) {

	// headers
	return {
		"content-type": "application/json",
		"x-access-token": (req.session.user ? req.session.user.token : ""),
		"x-key": (req.session.user ? req.session.user.user._id : ""),
	}
}

exports.getAPIUrl = function(req) {
	return 'http://localhost:' + ini.web.port + '/';
}


/**
 * @api {get} api/ Get server settings
 * @apiName GetAPIInfo
 * @apiDescription Retrieve server settings.
 * @apiGroup Information
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Object} settings Settings object
 * @apiSuccess {String} settings.name Server name
 * @apiSuccess {String} settings.description Server description
 * @apiSuccess {String} settings.web Server web port
 * @apiSuccess {String} settings.presence Server presence port
 * @apiSuccess {Object} settings.options Server options
 * @apiSuccess {String} settings.options.min-password-size Minimum size for password
 * @apiSuccess {Boolean} settings.options.statistics Statistics active or not
 * @apiSuccess {String} settings.options.cooke-age Expiration time for authentication token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Sugarizer Server",
 *       "description": "Your Sugarizer Server",
 *       "web": "8080",
 *       "presence": "8039",
 *       "options":
 *       {
 *         "min-password-size": "4",
 *         "statistics": true,
 *         "cookie-age": "172800000"
 *       }
 *     }
 **/
exports.getAPIInfo = function(req, res) {
	res.send({
		"name": ini.information.name,
		"description": ini.information.description,
		"web": ini.web.port,
		"presence": ini.presence.port,
		"options": {
			"min-password-size": ini.security.min_password_size,
			"statistics": ini.statistics.active,
			"cookie-age": ini.security.max_age
		}
	});
}

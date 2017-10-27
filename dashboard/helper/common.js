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
 * @apiSuccess {String} settings.web Server web port
 * @apiSuccess {String} settings.presence Server presence port
 * @apiSuccess {Object} settings.options Server options
 * @apiSuccess {Boolean} settings.options.statistics Statistics active or not
 * @apiSuccess {String} settings.options.cooke-age Expiration time for authentication token
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "web": "8080",
 *       "presence": "8039",
 *       "options":
 *       {
 *         "statistics": true,
 *         "cookie-age": "172800000"
 *       }
 *     }
 **/
exports.getAPIInfo = function(req, res) {
	res.send({
		"web": ini.web.port,
		"presence": ini.presence.port,
		"options": {
			"statistics": ini.statistics.active,
			"cookie-age": ini.cookie.max_age
		}
	});
}

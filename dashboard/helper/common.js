var fs = require('fs');
var os = require('os');
var ini = null;
var language = '*';
var moment = require('moment');

exports.init = function(settings) {
	ini = settings;
}

// language features
exports.l10n = {
	setLanguage: function(lang) {
		language = lang;
	},

	getLanguage: function() {
		return language;
	},

	get: function(text, params) {
		var locales = ini.locales[language];
		if (!locales) {
			locales = ini.locales['*'];
		}
		if (!locales[text]) {
			return text;
		}
		var translate = locales[text];
		for (var param in params) {
			translate = translate.replace('{{'+param+'}}', params[param]);
		}
		return translate;
	}
}

exports.reinitLocale = function(req) {
	// reinit l10n and moment with locale
	if (req.query && req.query.lang) {
		exports.l10n.setLanguage(req.query.lang);
		moment.locale(req.query.lang);
	}
};

exports.loadCredentials = function(settings) {
	if (!settings.security.certificate_file || !settings.security.key_file) {
		return null;
	}
	var cert, key;
	try {
		cert = fs.readFileSync(settings.security.certificate_file);
		key = fs.readFileSync(settings.security.key_file);
		if (!settings.security.strict_ssl) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		}
	} catch(err) {
		return null;
	}
	return {cert: cert, key: key};
}

exports.getHeaders = function(req) {

	// headers
	return {
		"content-type": "application/json",
		"x-access-token": (req.session.user ? req.session.user.token : ""),
		"x-key": (req.session.user ? req.session.user.user._id : ""),
	}
}

exports.getClientIP = function(req) {

	return req.headers['x-real-ip'] ||
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
}


exports.getServerIP = function() {

	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (var i in interfaces) {
		for (var j in interfaces[i]) {
			var address = interfaces[i][j];
			if (address.family === 'IPv6' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}
	addresses.push("::1");
	addresses.push("::ffff:127.0.0.1");
	return addresses;
}

exports.getAPIUrl = function(req) {
	return (ini.security.https ? 'https' : 'http' ) + "://localhost:" + ini.web.port + '/';
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
 * @apiSuccess {String} settings.secure Server is secured using SSL
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
 *       "secure": false,
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
		"secure": ini.security.https,
		"options": {
			"min-password-size": ini.security.min_password_size,
			"statistics": ini.statistics.active,
			"cookie-age": ini.security.max_age
		}
	});
}

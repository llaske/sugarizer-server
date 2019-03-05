// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	addUser = require('./addUser'),
	editUser = require('./editUser'),
	deleteUser = require('./deleteUser');

var _util = require('./util'),
	getClassrooms = _util.getClassrooms;


// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
};

exports.ini = function() {
	return ini;
};

// main landing page
exports.index = function(req, res) {

	// reinit l10n and moment with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
		moment.locale(req.query.lang);
	}

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.username != '') {
		query['q'] = req.query.username;
	}
	if (req.query.role != '') {
		query['role'] = req.query.role;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	if (req.query.classid != '') {
		query['classid'] = req.query.classid;
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// get classrooms list
			getClassrooms(req, function(classrooms){
			
				// send to activities page
				res.render('users', {
					module: 'users',
					moment: moment,
					query: query,
					classrooms: classrooms,
					data: body,
					account: req.session.user,
					server: ini.information
				});
			});
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.addUser = addUser;

exports.editUser = editUser;

exports.deleteUser = deleteUser;

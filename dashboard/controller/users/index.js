// include libraries
var superagent = require('superagent'),
	moment = require('moment'),
	common = require('../../helper/common'),
	searchUser = require('./searchUser'),
	addUser = require('./addUser'),
	editUser = require('./editUser'),
	deleteUser = require('./deleteUser'),
	profile = require('./profile'),
	importCSV = require('./importCSV'),
	exportCSV = require('./exportCSV'),
	enable2FA = require('./enable2FA'),
	disable2FA = require('./disable2FA');

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
	common.reinitLocale(req);

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
	if(req.query.sort !=''){
		query['sort'] = req.query.sort;
	}

	var classroom_id;
	if (req.query.classroom_id) {
		classroom_id = req.query.classroom_id;
	}

	// call
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/users')
		.set(common.getHeaders(req))
		.query(query)
		.end(function (error, response) {
			if (response.statusCode == 200) {

				// get classrooms list
				getClassrooms(req, function(classrooms){
	
					// send to activities page
					res.render('users', {
						module: 'users',
						moment: moment,
						query: query,
						classrooms: classrooms,
						classroom_id: classroom_id,
						data: response.body,
						headers: common.getHeaders(req),
						account: req.session.user,
						server: ini.information
					});
				});
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}
		});
};

exports.searchUser = searchUser;

exports.addUser = addUser;

exports.editUser = editUser;

exports.deleteUser = deleteUser;

exports.profile = profile;

exports.importCSV = importCSV;

exports.exportCSV = exportCSV;

exports.enable2FA = enable2FA;

exports.disable2FA = disable2FA;

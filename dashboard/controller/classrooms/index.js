// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../../helper/common'),
	addClassroom = require('./addClassroom'),
	deleteClassroom = require('./deleteClassroom'),
	editClassroom = require('./editClassroom');


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

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	//query
	var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.classroom != '') {
		query['q'] = req.query.classroom;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/classrooms'
	}, function(error, response, body) {
		console.log('error, response, body');
		if (response.statusCode == 200) {

			// send to activities page
			res.render('admin/classrooms', {
				module: 'classrooms',
				moment: moment,
				query: query,
				data: body,
				account: req.session.user,
				server: ini.information
			});

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
		}
	});
};

exports.addClassroom = addClassroom;

exports.deleteClassroom = deleteClassroom;

exports.editClassroom = editClassroom;

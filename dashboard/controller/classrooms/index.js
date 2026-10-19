// include libraries
var superagent = require('superagent'),
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
	if (req.query.q != '') {
		query['q'] = req.query.q;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	if(req.query.sort != ''){
		query['sort'] = req.query.sort;
	}

	superagent
		.get(common.getAPIUrl(req) + 'api/v1/classrooms')
		.set(common.getHeaders(req))
		.query(query)
		.end(function (error, response) {
			if (response.statusCode == 200) {

				// send to activities page
				res.render('classrooms', {
					module: 'classrooms',
					moment: moment,
					query: query,
					data: response.body,
					headers: common.getHeaders(req),
					account: req.session.user,
					server: ini.information
				});
	
			} else {
				req.flash('errors', {
					msg: common.l10n.get('ErrorCode'+response.body.code)
				});
			}	
		});
};

exports.addClassroom = addClassroom;

exports.deleteClassroom = deleteClassroom;

exports.editClassroom = editClassroom;

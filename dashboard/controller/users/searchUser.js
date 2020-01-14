// include libraries
var request = require('request'),
	common = require('../../helper/common');

module.exports = function searchUser(req, res) {

	// reinit l10n and moment with locale
	common.reinitLocale(req);

	//query
	var query = {
		sort: '+name',
		limit: 100,
		role: 'student'
	};

	//get query params
	if (req.query.q != '') {
		query['q'] = req.query.q;
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

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/users'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			return res.json({
				success: true,
				data: body,
				query: query
			});
		} else {
			res.json({success: false, msg: common.l10n.get('ErrorCode'+body.code)});
		}
	});
};

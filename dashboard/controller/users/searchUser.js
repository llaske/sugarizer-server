// include libraries
var superagent = require('superagent'),
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
	// if (req.query.q != '') {
	// 	query['q'] = req.query.q;
	// }
	if(req.query.username != '') {
		query['username']=req.query.username	//search parameter set to 'username' which is more consistent
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
	superagent
		.get(common.getAPIUrl(req) + 'api/v1/users')
		.set(common.getHeaders(req))
		.query(query)
		.end(function (error, response) {
			if (response.statusCode == 200) {
				return res.json({
					success: true,
					data: response.body,
					query: query
				});
			} else {
				res.json({success: false, msg: common.l10n.get('ErrorCode'+response.body.code)});
			}
		});
};

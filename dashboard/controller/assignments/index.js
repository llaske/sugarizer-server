var superagent = require('superagent'),
    moment = require('moment'),
    common = require('../../helper/common');

// init settings
var ini = null;
exports.init = function(settings) {
    ini = settings;
}

exports.ini = function() {
    return ini;
}

//main Loading page
exports.index = function(req, res) {
    common.reinitLocale(req);
    var query = {
		sort: '+name'
	};

	//get query params
	if (req.query.classroom != '') {
		query['q'] = req.query.assignments;
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
    console.log(ini.information)
    
    superagent
            .get(common.getAPIUrl(req) + 'api/v1/assignments')
            .set(common.getHeaders(req))
            .query(query)
            .end(function(error, response) {
                if (response.statusCode == 200) {
                    res.render('assignments', {
                        name:"Assignments",
                        moment: moment,
                        module: 'assignments',
                        headers: common.getHeaders(req),
                        message:"Sugarizer Asigments by codebloded",
                        server:ini.information,
                        account:req.session.user,
                    });
                }
            }
    );
}
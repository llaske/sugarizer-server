// include libraries
var request = require('request'),
    common = require('../helper/common');

export { fakeLaunch } from "./fakeLaunch";
export { launch } from "./launch";

	// init settings
var ini=null;
exports.init = function (setting) {
    ini = setting;

}

// main landing page
exports.index = function(req, res) {

	// reinit l10n with locale
	if (req.query && req.query.lang) {
		common.l10n.setLanguage(req.query.lang);
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			sort: '+index',
			name: (req.query.search ? req.query.search.trim() : undefined)
		},
		uri: common.getAPIUrl(req) + 'api/v1/activities'
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			// send to activities page
			res.render('activities', {
				module: 'activities',
				activities: body,
				headers: common.getHeaders(req),
				account: req.session.user,
				url: common.getAPIUrl(req),
				search: (req.query.search ? req.query.search.trim() : ''),
				server: ini.information
			});

		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/activities');
		}
	})
};

exports.fakeLaunch = function(req, res) {
	//validate
	if (!req.query.aid) {
		req.flash('errors', {
			msg: common.l10n.get('InvalidAid')
		});
		return res.redirect('/dashboard/activities');
	}

	//make sugar context
	var lsObj = {}
	lsObj['sugar_settings'] = {};
	lsObj['sugar_settings'].name = req.session.user.name;
	lsObj['sugar_settings'].color = 128;
	lsObj['sugar_settings'].colorvalue = {
		stroke: "#005FE4",
		fill: "#FF2B34"
	};
	lsObj['sugar_settings'].connected = false;
	lsObj['sugar_settings'].language = req.session.user.language;
	lsObj['sugar_settings'].networkId = req.session.user._id;
	lsObj['sugar_settings'].server = null;
	lsObj['sugar_settings'].view = 0;
	lsObj['sugar_settings'].activities = [];

	getActivity(req, req.query.aid, function(activity) {

		activity.instances = [];
		lsObj['sugar_settings'].activities.push(activity);
		lsObj['sugar_settings'] = JSON.stringify(lsObj['sugar_settings']);

		//launch url
		res.json({
			lsObj: lsObj,
			url: '/' + activity.directory + '/index.html' + formQueryString({
				a: activity.id,
				n: activity.name
			})
		});
	})
}

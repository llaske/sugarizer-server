// include libraries
var common = require('../../helper/common');

var _util = require('./util'),
	getActivity = _util.getActivity,
	formQueryString = _util.formQueryString;

module.exports = function fakeLaunch(req, res) {
	//validate
	if (!req.query.aid) {
		req.flash('errors', {
			msg: common.l10n.get('InvalidAid')
		});
		return res.redirect('/dashboard/activities');
	}

	//make sugar context
	var lsObj = {};
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

		if (!activity) {
			// Could happen for Android activities
			return res.redirect('/dashboard/');
		}

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
	});
};

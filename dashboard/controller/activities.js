// include libraries
var request = require('request'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

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
				search: (req.query.search ? req.query.search.trim() : '')
			});

		} else {
			req.flash('errors', {
				msg: body.message
			});
			return res.redirect('/dashboard/activities');
		}
	})
};

exports.fakeLaunch = function(req, res) {
	//validate
	if (!req.query.aid) {
		req.flash('errors', {
			msg: 'Invalid aid!'
		});
		return res.redirect('/dashboard/activities');
	}

	//make sugar context
	var lsObj = {}
	lsObj['sugar_settings'] = {};
	lsObj['sugar_settings'].name = req.session.user.name;
	lsObj['sugar_settings'].color = 128;
	lsObj['sugar_settings'].colorvalue = {
		stroke: '#fff',
		fill: '#uuu'
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

exports.launch = function(req, res) {

	//validate
	if (!req.query.oid || !req.params.jid) {
		req.flash('errors', {
			msg: 'Invalid oid or jid!'
		});
		return res.redirect('/dashboard/' + (req.query.source ? req.query.source : 'journal'));
	}

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: {
			fields: 'text,metadata',
			oid: req.query.oid
		},
		uri: common.getAPIUrl(req) + 'api/v1/journal/' + req.params.jid
	}, function(error, response, body) {
		if (response.statusCode == 200) {

			//validate
			if (body.entries.length == 0) {
				req.flash('errors', {
					msg: 'Object Not Found!'
				});
				return res.redirect('/dashboard/' + (req.query.source ? req.query.source : 'journal'));
			}

			// process data and create context
			var lsObj = {}
			lsObj['sugar_datastoretext_' + body.entries[0].objectId] = JSON.stringify(body.entries[0].text);

			body.entries[0].text = {
				link: 'sugar_datastoretext_' + body.entries[0].objectId
			}
			lsObj['sugar_datastore_' + body.entries[0].objectId] = JSON.stringify(body.entries[0]);

			//sugar settings
			lsObj['sugar_settings'] = {};

			// get user data
			getUser(req, body.entries[0].metadata.user_id, function(user) {

				//set fields
				lsObj['sugar_settings'].name = user.name;
				lsObj['sugar_settings'].color = 128;
				lsObj['sugar_settings'].colorvalue = user.color;
				lsObj['sugar_settings'].connected = false;
				lsObj['sugar_settings'].language = user.language;
				lsObj['sugar_settings'].networkId = user._id;
				lsObj['sugar_settings'].server = null;
				lsObj['sugar_settings'].view = 0;
				lsObj['sugar_settings'].activities = [];

				getActivity(req, body.entries[0].metadata.activity, function(activity) {

					activity.instances = [body.entries[0]];
					lsObj['sugar_settings'].activities.push(activity);
					lsObj['sugar_settings'] = JSON.stringify(lsObj['sugar_settings']);

					//launch url
					res.json({
						lsObj: lsObj,
						url: '/' + activity.directory + '/index.html' + formQueryString({
							aid: body.entries[0].metadata.activity_id,
							a: activity.id,
							o: body.entries[0].objectId,
							n: activity.name
						})
					});
				})
			});
		} else {
			req.flash('errors', {
				msg: body.error
			});
			return res.redirect('/dashboard/' + (req.query.source ? req.query.source : 'journal'));
		}
	})
};

function getActivity(req, aid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities/' + aid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body)
		}
	});
}

function getUser(req, uid, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/users/' + uid
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			// callback
			callback(body)
		}
	});
}

function formQueryString(params) {
	var str = [];
	for (var p in params)
		if (params.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
		}
	return '?' + str.join("&");
}

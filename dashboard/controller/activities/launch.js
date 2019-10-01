// include libraries
var request = require('request'),
	common = require('../../helper/common');

var _util = require('./util'),
	getActivity = _util.getActivity,
	getUser = _util.getUser,
	formQueryString = _util.formQueryString;

module.exports = function launch(req, res) {

	//validate
	if (!req.query.oid || !req.params.jid) {
		req.flash('errors', {
			msg: common.l10n.get('InvalidOidJid')
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
			var ver = parseFloat(body.version);

			//validate
			if (body.entries.length == 0) {
				req.flash('errors', {
					msg: common.l10n.get('ObjectNotFound')
				});
				return res.redirect('/dashboard/' + (req.query.source ? req.query.source : 'journal'));
			}

			// process data and create context
			var lsObj = {};

			if (ver > 1.1) {
				lsObj['sugar_datastoretext_' + body.entries[0].objectId] = body.entries[0].text;
			} else {
				lsObj['sugar_datastoretext_' + body.entries[0].objectId] = JSON.stringify(body.entries[0].text);
			}
			
			
			if (ver > 1.1) {
				body.entries[0].text = {
					link: body.entries[0].objectId
				};
			} else {
				body.entries[0].text = {
					link: 'sugar_datastoretext_' + body.entries[0].objectId
				};
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

				if (!body.entries[0].metadata.activity) {
					return res.json({
						error: common.l10n.get('NoLinkedActivityFound')
					});
				}
				getActivity(req, body.entries[0].metadata.activity, function(activity) {
					if (!activity) {
						return res.json({
							error: common.l10n.get('NoLinkedActivityFound')
						});
					}
					
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
						}),
						version: ver,
						objectId: body.entries[0].objectId
					});
				});
			});
		} else {
			req.flash('errors', {
				msg: common.l10n.get('ErrorCode'+body.code)
			});
			return res.redirect('/dashboard/' + (req.query.source ? req.query.source : 'journal'));
		}
	});
};

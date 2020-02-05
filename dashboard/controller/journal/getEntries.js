// include libraries
var moment = require('moment'),
	common = require('../../helper/common');

var _util = require('./util'),
	getActivities = _util.getActivities,
	getJournalEntries = _util.getJournalEntries,
	getUser = _util.getUser,
	getSharedJournalId = _util.getSharedJournalId;

var journal = require('./index');

module.exports = function getEntries(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	getSharedJournalId(req, res, function(shared) {
		var query = {
			limit: (req.query.limit ? req.query.limit : 10),
			sort: (req.query.sort ? req.query.sort : '-timestamp'),
			offset: (req.query.offset ? req.query.offset : 0)
		};
		if (req.params.jid) {
			query['journal'] = req.params.jid;
		}
		if (req.query.uid) {
			query['uid'] = req.query.uid;
			query['type'] = "private";
		} else {
			query['type'] = "shared";
		}

		//get activties
		getActivities(req, res, function(activities) {

			//make hashlist
			var hashList = {};
			for (var i = 0; i < activities.length; i++) {
				hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
			}

			//get entries
			getJournalEntries(req, res, query, function(entries) {
				
				if (req.query.uid) {
					//get user
					getUser(req, res, function(user) {
						//render template
						res.render('journal', {
							module: 'journals',
							moment: moment,
							entries: entries,
							iconList: hashList,
							query: query,
							user: user,
							shared: shared,
							account: req.session.user,
							server: journal.ini().information
						});
					});
				} else {
					//render template
					res.render('journal', {
						module: 'journals',
						moment: moment,
						entries: entries,
						iconList: hashList,
						query: query,
						user: undefined,
						shared: shared,
						account: req.session.user,
						server: journal.ini().information
					});
				}
			});
		});
		
	});
};

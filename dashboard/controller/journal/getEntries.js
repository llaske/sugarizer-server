// include libraries
var moment = require('moment'),
	common = require('../../helper/common');

var _util = require('./util'),
	getActivities = _util.getActivities,
	getJournalEntries = _util.getJournalEntries,
	getUser = _util.getUser;

var journal = require('./index');

module.exports = function getEntries(req, res) {

	// reinit l10n and momemt with locale
	common.reinitLocale(req);

	//get user
	getUser(req, res, function(user) {

		var query = {
			uid: req.query.uid,
			journal: req.params.jid,
			type: req.query.type,
			limit: (req.query.limit ? req.query.limit : 10),
			sort: (req.query.sort ? req.query.sort : '-timestamp'),
			offset: (req.query.offset ? req.query.offset : 0)
		};

		//get activties
		getActivities(req, res, function(activities) {

			//make hashlist
			var hashList = {};
			for (var i = 0; i < activities.length; i++) {
				hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
			}

			//get entries
			getJournalEntries(req, res, query, function(entries) {

				//render template
				res.render('journal', {
					module: 'journals',
					moment: moment,
					entries: entries,
					iconList: hashList,
					query: query,
					user: user,
					account: req.session.user,
					server: journal.ini().information
				});
			});
		});
	});
};

// include libraries
var request = require('request'),
	dashboard = require('./dashboard'),
	moment = require('moment'),
	common = require('../helper/common'),
	async = require('async');

exports.getGraph = function(req, res) {

	if (req.query.type == 'top-contributor') {
		getTopContributors(req, res);
	}
	if (req.query.type == 'top-activities') {
		getTopActivities(req, res);
	}
	if (req.query.type == 'recent-users') {
		getRecentUsers(req, res);
	}
	if (req.query.type == 'recent-activities') {
		getRecentActivities(req, res);
	}
}

var averageEntries = 0.0;
exports.getAverageEntries = function() {
	return averageEntries;
}

function getTopContributors(req, res) {

	//get all users
	dashboard.getAllUsers(req, res, function(users) {

		//make hashList
		var hashList = {};
		for (var i = 0; i < users.users.length; i++) {
			hashList[users.users[i].private_journal] = users.users[i];
		}

		//get journal data
		dashboard.getAllJournals(req, res, function(journals) {

			//get name mapping
			var totalEntries = 0;
			var j2 = [];
			for (var i = 0; i < journals.length; i++) {
				if (hashList[journals[i]._id] != undefined) {
					journals[i].user = hashList[journals[i]._id].name;
					j2.push(journals[i]);
					totalEntries += journals[i].count;
				}
			}
			averageEntries = (totalEntries / journals.length).toFixed(2);
			journals = j2;

			//separate out top users
			journals.sort(function(a, b) {
				if (a.count > b.count)
					return -1;
				if (a.count < b.count)
					return 1;
				return 0;
			});

			//take 5 entries
			journals = journals.slice(0, 5);

			//get labels & data
			var labels = [];
			var data = [];
			for (var i = 0; i < journals.length; i++) {
				labels.push(journals[i].user);
				data.push(journals[i].count);
			}

			//return
			return res.json({
				data: {
					labels: labels,
					datasets: [{
						label: common.l10n.get('CountEntries'),
						data: data,
						backgroundColor: [
							'rgba(155, 99, 132, 0.8)',
							'rgba(54, 162, 235, 0.8)',
							'rgba(255, 206, 86, 0.8)',
							'rgba(75, 192, 192, 0.8)',
							'rgba(153, 102, 255, 0.8)'
						]
					}]
				},
				element: req.query.element,
				graph: 'bar',
				options: {
					scales: {
						yAxes: [{
							ticks: {
								min: 0
							}
						}]
					}
				}
			})
		})
	})
}

function getTopActivities(req, res) {

	//get activities
	getActivities(req, res, function(activities) {

		//get all entries
		getAllEntriesList(req, res, 10000000, function(allEntries) {
			var freq = {};
			var freq2 = [];
			for (var i = 0; i < allEntries.length; i++) {
				if (freq[allEntries[i].metadata.activity] == undefined) {
					freq[allEntries[i].metadata.activity] = {
						id: allEntries[i].metadata.activity,
						count: 1
					};
				} else {
					freq[allEntries[i].metadata.activity].count++;
				}
			}
			for (var key in freq) {
				freq2.push(freq[key]);
			}
			freq2.sort(function(a, b) {
				if (a.count > b.count)
					return -1;
				if (a.count < b.count)
					return 1;
				return 0;
			});

			//take 5 entries
			freq2 = freq2.slice(0, 5);

			//get labels & data
			var labels = [];
			var data = [];
			for (var i = 0; i < freq2.length; i++) {
				var label = freq2[i].id;
				for (var j = 0 ; j < activities.length ; j++) {
					if (label == activities[j].id) {
						label = activities[j].name;
						break;
					}
				}
				labels.push(label);
				data.push(freq2[i].count);
			}

			//return data
			return res.json({
				data: {
					labels: labels,
					datasets: [{
						label: common.l10n.get('CountEntries'),
						data: data,
						backgroundColor: [
							'rgba(205, 99, 132, 0.8)',
							'rgba(54, 162, 235, 0.8)',
							'rgba(255, 206, 86, 0.8)',
							'rgba(75, 192, 192, 0.8)',
							'rgba(153, 102, 255, 0.8)'
						]
					}]
				},
				element: req.query.element,
				graph: 'doughnut'
			})
		})
	})
}

function getRecentUsers(req, res) {

	//get all entries
	dashboard.getAllUsers(req, res, function(users) {

		//get users object
		users = users.users

		//limit 5
		users = users.splice(0, 5);

		var data = '';
		for (var i = 0; i < users.length; i++) {

			var url = '/dashboard/journal/' + users[i].private_journal + '?uid=' + users[i]._id + '&type=private'
			data += '<tr onclick="window.document.location=\'' + url + '\'">\
									<td>' + (i + 1) + '</td>\
									<td><div class="color" id="' + users[i]._id + i.toString() + '"><div class="xo-icon"></div></div></td>\
									<script>new icon().load("/public/img/owner-icon.svg", ' + JSON.stringify(users[i].color) + ', "' + users[i]._id + i.toString() + '")</script>\
									<td title="' + users[i].name + '">' + users[i].name + '</td>\
									<td class="text-muted">' + moment(users[i].timestamp).calendar(); + '</td>\
							</tr>'
		}

		return res.json({
			data: data,
			element: req.query.element,
			graph: 'table'
		})
	})
}

function getRecentActivities(req, res) {

	//get all entries
	getAllEntriesList(req, res, 1000000, function(allEntries) {

		//get activities
		getActivities(req, res, function(activities) {

			//make hashlist
			var hashList = {};
			for (var i = 0; i < activities.length; i++) {
				hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon
			}

			//sort entries
			allEntries.sort(function(a, b) {
				if (a.metadata.timestamp > b.metadata.timestamp)
					return -1;
				if (a.metadata.timestamp < b.metadata.timestamp)
					return 1;
				return 0;
			});

			//limit 5
			allEntries = allEntries.splice(0, 5);

			var data = '';
			for (var i = 0; i < allEntries.length; i++) {

				// launch url
				var url = '/dashboard/activities/launch/' + allEntries[i].journalId + '?oid=' + allEntries[i].objectId + '&uid=' + allEntries[i].metadata.user_id + '&aid=' + allEntries[i].metadata.activity

				data += '<tr onclick="javascript:launch_activity(\'' + url + '\')">\
										<td>' + (i + 1) + '</td>\
										<td><div class="color" id="' + allEntries[i].objectId + i.toString() + '"><div class="xo-icon"></div></div></td>\
										<script>new icon().load("' +  (hashList[allEntries[i].metadata.activity] || '/public/img/application-x-generic.svg') + '", ' + JSON.stringify(allEntries[i].metadata.buddy_color) + ', "' + allEntries[i].objectId + i.toString() + '")</script>\
										<td title="' + allEntries[i].metadata.title + '">' + allEntries[i].metadata.title + '</td>\
										<td class="text-muted">' + moment(allEntries[i].metadata.timestamp).calendar() + '</td>\
								</tr>'
			}

			return res.json({
				data: data,
				element: req.query.element,
				graph: 'table'
			})
		})
	})
}

function getAllEntriesList(req, res, limit, callback) {

	//get all users
	dashboard.getAllUsers(req, res, function(users) {

		//entries
		var allEntries = [];

		//async
		async.series([
			function(callback) {
				if (users.users.length > 0) {
					// call
					request({
						headers: common.getHeaders(req),
						json: true,
						method: 'GET',
						qs: {
							offset: 0,
							limit: limit,
							sort: '-timestamp'
						},
						uri: common.getAPIUrl(req) + 'api/v1/journal/' + users.users[0].shared_journal
					}, function(error, response, body) {
						//merge data
						if (body.entries) {
							allEntries = allEntries.concat(body.entries);
						}
						callback(null);
					});
				} else {
					callback(null);
				}
			},
			function(callback) {
				//for each user
				async.each(users.users, function(user, icallback) {
					// call
					request({
						headers: common.getHeaders(req),
						json: true,
						method: 'GET',
						qs: {
							uid: user._id,
							offset: 0,
							limit: limit,
							sort: '-timestamp'
						},
						uri: common.getAPIUrl(req) + 'api/v1/journal/' + user.private_journal
					}, function(error, response, body) {
						//merge data
						if (body.entries) {
							allEntries = allEntries.concat(body.entries);
						}
						icallback();
					});
				}, function() {
					callback(null);
				});

			}
		], function() {
			callback(allEntries);
		});
	})
}

function getActivities(req, res, callback) {
	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/activities/'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			//store
			callback(body);
		} else {
			req.flash('errors', {
				msg: body.error
			});
			return res.redirect('/dashboard/journal');
		}
	})
}

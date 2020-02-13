var request = require('request'),
	dashboard_utils = require('../../dashboard/util'),
	moment = require('moment'),
	common = require('../../../helper/common');


var averageEntries = 0.0;
exports.averageEntries = function() {
	return averageEntries;
};

exports.getTopContributors = function(req, res) {

	//get all users
	dashboard_utils.getAllUsers(req, res, function(users) {

		//make hashList
		var hashList = {};
		for (var i = 0; i < users.users.length; i++) {
			hashList[users.users[i].private_journal] = users.users[i];
		}

		//get journal data
		dashboard_utils.getAllJournals(req, res, function(journals) {

			//get name mapping
			var totalEntries = 0;
			var j2 = [];
			for (var i = 0; i < journals.length; i++) {
				if (hashList[journals[i]._id] != undefined) {
					journals[i].user = hashList[journals[i]._id].name;
					journals[i].userID = hashList[journals[i]._id]._id;
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

			//get labels, data, journal IDs and user IDs
			var labels = [], data = [], journalIDs = [], userIDs = [];

			for (var i = 0; i < journals.length; i++) {
				labels.push(journals[i].user);
				data.push(journals[i].count);
				journalIDs.push(journals[i]._id);
				userIDs.push(journals[i].userID);
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
				},
				journalIDs: journalIDs,
				userIDs: userIDs
			});
		});
	});
};

exports.getTopActivities = function(req, res) {

	//get activities
	getActivities(req, res, function(activities) {

		//get all entries
		getAllEntriesList(req, res, function(allEntries) {
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

			//get labels, data & activity IDs
			var labels = [], data = [], activityIDs = [];
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
				activityIDs.push(freq2[i].id);
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
				graph: 'doughnut',
				activityIDs: activityIDs
			});
		});
	});
};

exports.getRecentStudents = function(req, res) {
	//get all entries
	dashboard_utils.getAllUsers(req, res, function(users) {

		//get users object
		users = users.users;

		//limit 5
		users = users.splice(0, 5);

		var data = '';
		for (var i = 0; i < users.length; i++) {

			var url = '/dashboard/journal/' + users[i].private_journal + '?uid=' + users[i]._id + '&type=private';
			data += '<tr onclick="window.document.location=\'' + url + '\'">\
									<td>' + (i + 1) + '</td>\
									<td><div class="color" id="' + users[i]._id + i.toString() + '"><div class="xo-icon"></div></div></td>\
									<script>new icon().load("/public/img/owner-icon.svg", ' + JSON.stringify(users[i].color) + ', "' + users[i]._id + i.toString() + '")</script>\
									<td title="' + users[i].name + '">' + users[i].name + '</td>\
									<td class="text-muted">' + moment(users[i].timestamp).calendar(); + '</td>\
							</tr>';
		}

		return res.json({
			data: data,
			element: req.query.element,
			graph: 'table'
		});
	});
};

exports.getRecentTeachers = function(req, res) {
	req.query.role = 'teacher';
	//get all entries
	dashboard_utils.getAllUsers(req, res, function(users) {

		//get users object
		users = users.users;

		//limit 5
		users = users.splice(0, 5);

		var data = '';
		for (var i = 0; i < users.length; i++) {

			data += '<tr>\
						<td>' + (i + 1) + '</td>\
						<td title="' + users[i].name + '">' + users[i].name + '</td>\
						<td class="text-muted">' + moment(users[i].timestamp).calendar(); + '</td>\
					</tr>';
		}

		return res.json({
			data: data,
			element: req.query.element,
			graph: 'table'
		});
	});
};

exports.getRecentAdmins = function(req, res) {
	req.query.role = 'admin';
	//get all entries
	dashboard_utils.getAllUsers(req, res, function(users) {

		//get users object
		users = users.users;

		//limit 5
		users = users.splice(0, 5);

		var data = '';
		for (var i = 0; i < users.length; i++) {

			data += '<tr>\
						<td>' + (i + 1) + '</td>\
						<td title="' + users[i].name + '">' + users[i].name + '</td>\
						<td class="text-muted">' + moment(users[i].timestamp).calendar(); + '</td>\
					</tr>';
		}

		return res.json({
			data: data,
			element: req.query.element,
			graph: 'table'
		});
	});
};

exports.getRecentActivities = function(req, res) {

	//get all entries
	getAllEntriesList(req, res, function(allEntries) {

		//get activities
		getActivities(req, res, function(activities) {

			//make hashlist
			var hashList = {};
			for (var i = 0; i < activities.length; i++) {
				hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
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
				var url = '/dashboard/activities/launch/' + allEntries[i].journalId + '?oid=' + allEntries[i].objectId + '&uid=' + allEntries[i].metadata.user_id + '&aid=' + allEntries[i].metadata.activity;

				var iconURL = hashList[allEntries[i].metadata.activity] || '/public/img/application-x-generic.svg';
				if (allEntries[i].metadata.mimetype == "text/plain") {
					iconURL = '/public/img/application-x-txt.svg';
				} else if (allEntries[i].metadata.mimetype == "application/pdf") {
					iconURL = '/public/img/application-x-pdf.svg';
				} else if (allEntries[i].metadata.mimetype == "application/msword") {
					iconURL = '/public/img/application-x-doc.svg';
				} else if (allEntries[i].metadata.mimetype == "application/vnd.oasis.opendocument.text") {
					iconURL = '/public/img/application-x-odt.svg';
				}

				data += '<tr onclick="javascript:launch_activity(\'' + url + '\')">\
										<td>' + (i + 1) + '</td>\
										<td><div class="color" id="' + allEntries[i].objectId + i.toString() + '"><div class="xo-icon"></div></div></td>\
										<script>new icon().load("' +  iconURL + '", ' + JSON.stringify(allEntries[i].metadata.buddy_color) + ', "' + allEntries[i].objectId + i.toString() + '")</script>\
										<td title="' + allEntries[i].metadata.title + '">' + allEntries[i].metadata.title + '</td>\
										<td title="' + allEntries[i].metadata.buddy_name + '">' + allEntries[i].metadata.buddy_name + '</td>\
										<td class="text-muted">' + moment(allEntries[i].metadata.timestamp).calendar() + '</td>\
								</tr>';
			}

			return res.json({
				data: data,
				element: req.query.element,
				graph: 'table'
			});
		});
	});
};

function getAllEntriesList(req, res, callback) {

	//entries
	var allEntries = [];

	// call
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		uri: common.getAPIUrl(req) + 'api/v1/journal/aggregate/'
	}, function(error, response, body) {
		//merge data
		if (body) {
			for (var i=0; i<body.length; i++) {
				if (body[i] && typeof body[i].content == "object" && body[i].content.length > 0) {
					for (var j=0; j<body[i].content.length; j++) {
						body[i].content[j].journalId = body[i]._id;
						body[i].content[j].shared = body[i].shared;
						allEntries.push(body[i].content[j]);
					}
				}
			}
		}
		callback(allEntries);
	});
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
	});
}

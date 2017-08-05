// include libraries
var request = require('request'),
	dashboard = require('./dashboard'),
	moment = require('moment'),
	common = require('../helper/common'),
	sync = require('synchronize');

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
			var j2 = [];
			for (var i = 0; i < journals.length; i++) {
				if (hashList[journals[i]._id] != undefined) {
					journals[i].user = hashList[journals[i]._id].name;
					j2.push(journals[i]);
				}
			}
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
						label: '# of Entries',
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
				graph: 'bar'
			})
		})
	})
}

function getTopActivities(req, res) {

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
			labels.push(freq2[i].id.split('.')[2]);
			data.push(freq2[i].count);
		}

		//return data
		return res.json({
			data: {
				labels: labels,
				datasets: [{
					label: '# of Entries',
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
}

function getRecentUsers(req, res) {

	//get all entries
	getAllEntriesList(req, res, 1, function(allEntries) {

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
			data += '<tr>\
									<td>' + (i + 1) + '</td>\
									<td title="' + allEntries[i].metadata.buddy_name + '">' + allEntries[i].metadata.buddy_name + '</td>\
									<td class="text-muted">' + moment(allEntries[i].metadata.timestamp).calendar(); + '</td>\
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
			data += '<tr>\
									<td>' + (i + 1) + '</td>\
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
}

function getAllEntriesList(req, res, limit, callback) {

	//get all users
	dashboard.getAllUsers(req, res, function(users) {

		//entries
		var allEntries = [];

		//setup sync fibre
		sync.fiber(function() {

			//for each user
			for (var i = 0; i < users.users.length; i++) {

				// call
				var d = (sync.await(request({
					headers: common.getHeaders(req),
					json: true,
					method: 'GET',
					qs: {
						uid: users.users[i]._id,
						offset: 0,
						limit: limit,
						sort: '-timestamp'
					},
					uri: common.getAPIUrl(req) + 'api/v1/journal/' + users.users[i].private_journal
				}, sync.defer())))

				//merge data
				allEntries = allEntries.concat(d.body.entries)
			}
			callback(allEntries);
		})
	})
}

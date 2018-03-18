// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
}

// main landing page
exports.index = function(req, res) {

	// reinit momemt with locale
	if (req.query && req.query.lang) {
		moment.locale(req.query.lang);
	}

	// send to login page
	res.render('stats', {
		title: 'stats',
		module: 'stats',
		account: req.session.user,
		server: ini.information
	});
};

exports.getGraph = function(req, res) {
	if (req.query.type == 'how-user-launch-activities') {
		getHowUserLaunchActivity(req, res);
	}
	if (req.query.type == 'how-often-user-change-settings') {
		getHowOftenUserChangeSettings(req, res);
	}

}

function getHowUserLaunchActivity(req, res) {

	//data var
	var data = []

	// get data
	getLogsData(req, res, {
		event_action: 'launch_activity'
	}, function(body) {
		data = data.concat(body)
		getLogsData(req, res, {
			event_action: 'relaunch_activity'
		}, function(body) {
			data = data.concat(body)

			var d = {}
			for (var i = 0; i < data.length; i++) {
				if (!d.hasOwnProperty(data[i].event_object)) {
					d[data[i].event_object] = 0
				} else {
					d[data[i].event_object]++
				}
			}

			var labels = []
			var ddata = []
			for (var v in d) {
				labels.push(v)
				ddata.push(d[v])
			}

			//return
			return res.json({
				data: {
					labels: labels,
					datasets: [{
						data: ddata,
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
				graph: 'pie'
			})
		})
	})
}

function getHowOftenUserChangeSettings(req, res) {

	//data
	var data = {
		labels: [],
		data: []
	}

	// get data
	getLogsData(req, res, {
		event_object: 'my_settings',
		event_action: 'click',
		event_label: 'about_me'
	}, function(body) {
		data.labels.push(common.l10n.get('NameColorSettings'));
		data.data.push(body.length);
		getLogsData(req, res, {
			event_object: 'my_settings',
			event_action: 'click',
			event_label: 'language'
		}, function(body) {
			data.labels.push(common.l10n.get('LanguageSettings'));
			data.data.push(body.length);
			getLogsData(req, res, {
				event_object: 'my_settings',
				event_action: 'click',
				event_label: 'security'
			}, function(body) {
				data.labels.push(common.l10n.get('SecuritySettings'));
				data.data.push(body.length);
				getLogsData(req, res, {
					event_object: 'my_settings',
					event_action: 'click',
					event_label: 'privacy'
				}, function(body) {
					data.labels.push(common.l10n.get('PrivacySettings'));
					data.data.push(body.length);

					// node data
					if(JSON.stringify(data.data) == JSON.stringify([0, 0]))data.data = []

					//return
					return res.json({
						data: {
							labels: data.labels,
							datasets: [{
								label: common.l10n.get('CountSettingsChanged'),
								data: data.data,
								backgroundColor: [
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
		})
	})
}


function getLogsData(req, res, query, callback) {
	request({
		headers: common.getHeaders(req),
		json: true,
		method: 'GET',
		qs: query,
		uri: common.getAPIUrl(req) + 'api/v1/stats'
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			callback(body)
		}else{
			callback([])
		}
	});
}

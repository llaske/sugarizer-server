// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');

// main landing page
exports.index = function(req, res) {

	// send to login page
	res.render('stats', {
		title: 'stats',
		module: 'stats',
		account: req.session.user
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
	//return
	return res.json({
		data: {
			labels: ['List-View', 'Home-View'],
			datasets: [{
				label: '# of Launches',
				data: [12, 42],
				backgroundColor: [
					'rgba(255, 206, 86, 0.8)',
					'rgba(75, 192, 192, 0.8)'
				]
			}]
		},
		element: req.query.element,
		graph: 'pie'
	})
}

function getHowOftenUserChangeSettings(req, res) {
	//return
	return res.json({
		data: {
			labels: ['may', 'june', 'july', 'aug', 'sep', 'oct'],
			datasets: [{
				label: '# of times settings changed',
				data: [12, 25, 2, 1, 5, 11],
				fill: false,
				borderColor: '#FF6384',
				backgroundColor: '#FF6384'
			}]
		},
		element: req.query.element,
		graph: 'line'
	})
}

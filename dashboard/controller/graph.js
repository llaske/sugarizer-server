// include libraries
var request = require('request'),
	moment = require('moment'),
	common = require('../helper/common');


exports.getGraph = function(req, res) {

	// get all data and store in session

	if (req.query.type == 'top-contributor') {
		getTopContributors(req, res);
	}
	if (req.query.type == 'top-activities') {
		getTopActivities(req, res);
	}
}

function getTopContributors(req, res) {

	return res.json({
		data: {
			labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2],
				backgroundColor: [
					'rgba(255, 99, 132, 0.8)',
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
}

function getTopActivities(req, res) {

	return res.json({
		data: {
			labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2],
				backgroundColor: [
					'rgba(255, 99, 132, 0.8)',
					'rgba(54, 162, 235, 0.8)',
					'rgba(255, 206, 86, 0.8)',
					'rgba(75, 192, 192, 0.8)',
					'rgba(153, 102, 255, 0.8)'
				]
			}]
		},
		element: req.query.element,
		graph: 'line'
	})
}

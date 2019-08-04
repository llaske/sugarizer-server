// stats handling
var mongo = require('mongodb');

var chartsCollection;
var usersCollection;

var db;

// Init database
exports.init = function(settings, database) {
	chartsCollection = settings.collections.charts;
	usersCollection = settings.collections.users;
	db = database;
};

// Find all charts
exports.findAll = function(req, res) {
	//form query
	var query = {
		user_id: new mongo.ObjectID(req.user._id)
	};

	query = addQuery('key', req.query, query);
	query = addQuery("q", req.query, query);

	var options = {};

	//get options
	if (req.query.sort) {
		options = getOptions(req, '+timestamp');
	}

	//get data
	db.collection(chartsCollection, function(err, collection) {
		collection.find(query, options).toArray(function(err, data) {
			if (!(req.query.key || req.query.q || req.query.sort) && typeof req.user.charts == 'object' && req.user.charts.length > 0) {
				var expectedOrder = req.user.charts.map(function (chart) {
					return chart.toString();
				});
				var orderedData = new Array(req.user.charts.length);
				for (var i=0; i<data.length; i++) {
					if (expectedOrder.indexOf(data[i]._id.toString()) != -1) {
						orderedData[expectedOrder.indexOf(data[i]._id.toString())] = data[i];
					}
				}
				res.send({charts: orderedData});
			} else {
				res.send({charts: data});
			}
		});
	});
};

// Find chart by ID
exports.findById = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 23
		});
		return;
	}
	db.collection(chartsCollection, function(err, collection) {
		collection.findOne(
			{
				_id: new mongo.ObjectID(req.params.chartid),
				user_id: new mongo.ObjectID(req.user._id)
			},
			function(err, chart) {
				if (!chart) {
					res.status(401).send({});
					return;
				}
				res.send(chart);
			}
		);
	});
};

// Create Chart
exports.addChart = function(req, res) {
	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 22
		});
		return;
	}

	//parse user details
	var chart = JSON.parse(req.body.chart);

	//add timestamp & language
	chart.created_time = +new Date();
	chart.timestamp = +new Date();
	chart.user_id = new mongo.ObjectID(req.user._id);

	// store
	db.collection(chartsCollection, function(err, collection) {
		collection.insertOne(
			chart,
			{
				safe: true
			},
			function(err, result) {
				if (err) {
					res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						db.collection(usersCollection, function(err, collection) {
							collection.updateOne({
								_id: new mongo.ObjectID(req.user._id)
							},
							{
								$push: {
									charts: result.ops[0]._id // Push chart ID
								}
							}, {
								safe: true
							},
							function(err, rest) {
								if (err) {
									return res.status(500).send({
										'error': 'An error has occurred',
										'code': 10
									});
								} else {
									if (rest && rest.result && rest.result.n == 1) {
										res.send(result.ops[0]);
									} else {
										return res.status(401).send({
											'error': 'Error while adding chart',
											'code': 15
										});
									}
								}
							});
						});
					} else {
						res.status(401).send({
							error: "Inexisting chart id",
							code: 23
						});
					}
				}
			}
		);
	});
};

// Delete Chart
exports.removeChart = function(req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 23
		});
		return;
	}

	db.collection(chartsCollection, function(err, collection) {
		collection.deleteOne(
			{
				_id: new mongo.ObjectID(req.params.chartid)
			},
			function(err, result) {
				if (err) {
					res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						db.collection(usersCollection, function(err, collection) {
							collection.updateOne({
								_id: new mongo.ObjectID(req.user._id)
							},
							{
								$pull: {
									charts: new mongo.ObjectID(req.params.chartid)
								}
							}, {
								safe: true
							},
							function(err, result) {
								if (err) {
									return res.status(500).send({
										'error': 'An error has occurred',
										'code': 10
									});
								} else {
									if (result && result.result && result.result.n == 1) {
										res.send({
											id: req.params.chartid
										});
									} else {
										return res.status(401).send({
											'error': 'Error while adding chart',
											'code': 15
										});
									}
								}
							});
						});
					} else {
						res.status(401).send({
							error: "Inexisting chart id",
							code: 23
						});
					}
				}
			}
		);
	});
};

// Edit Chart
exports.updateChart = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 23
		});
		return;
	}

	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 22
		});
		return;
	}

	var chartid = req.params.chartid;
	var chart = JSON.parse(req.body.chart);

	//add timestamp & language
	chart.timestamp = +new Date();

	//update the chart
	db.collection(chartsCollection, function(err, collection) {
		collection.updateOne(
			{
				_id: new mongo.ObjectID(chartid),
				user_id: new mongo.ObjectID(req.user._id)
			},
			{
				$set: chart
			},
			{
				safe: true
			},
			function(err, result) {
				if (err) {
					res.status(500).send({
						error: "An error has occurred",
						code: 10
					});
				} else {
					if (result && result.result && result.result.n == 1) {
						collection.findOne(
							{
								_id: new mongo.ObjectID(chartid)
							},
							function(err, chartResponse) {
								// return
								res.send(chartResponse);
							}
						);
					} else {
						res.status(401).send({
							error: "Inexisting chart id",
							code: 23
						});
					}
				}
			}
		);
	});
};

// Reorder chart list
exports.reorderChart = function (req, res) {
	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 22
		});
		return;
	}

	var chart = JSON.parse(req.body.chart);

	var list = [];
	if (chart.list) {
		list = chart.list.map(function(id) {
			return new mongo.ObjectID(id);
		});
	}

	db.collection(usersCollection, function(err, collection) {
		collection.updateOne({
			_id: new mongo.ObjectID(req.user._id)
		},
		{
			$set: {
				charts: list
			}
		}, {
			safe: true
		},
		function(err, result) {
			if (err) {
				return res.status(500).send({
					'error': 'An error has occurred',
					'code': 10
				});
			} else {
				if (result && result.result && result.result.n == 1) {
					res.send({
						charts: list
					});
				} else {
					return res.status(401).send({
						'error': 'Error while updating charts',
						'code': 15
					});
				}
			}
		});
	});
};

function getOptions(req, def_sort) {

	//prepare options
	var sort_val = (typeof req.query.sort === "string" ? req.query.sort : def_sort);
	var sort_type = sort_val.indexOf("-") == 0 ? 'desc' : 'asc';
	var options = {
		sort: [
			[sort_val.substring(1), sort_type]
		]
	};
	return options;
}

//private function for filtering and sorting
function addQuery(filter, params, query, default_val) {

	//check default case
	query = query || {};

	//validate
	if (typeof params[filter] != "undefined" && typeof params[filter] === "string") {
		if (filter == "q") {
			query["title"] = {
				$regex: new RegExp(params[filter], "i")
			};
		} else {
			query[filter] = {
				$regex: new RegExp("^" + params[filter] + "$", "i")
			};
		}
	} else {
		//default case
		if (typeof default_val != "undefined") {
			query[filter] = default_val;
		}
	}

	//return
	return query;
}

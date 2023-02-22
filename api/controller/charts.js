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

/**
 * @api {get} api/v1/charts/ Get all charts
 * @apiName GetAllcharts
 * @apiDescription Retrieve all charts registered on the server for a user.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiExample Example usage:
 *     "/api/v1/charts"
 *
 * @apiSuccess {Object[]} charts List of charts
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "charts": [
 *         {
 *           "_id": '5d4f1f0380b17154007ac04f',
 *           "title": 'SugarizerChart1_1565466370822',
 *           "key": 'how-often-user-change-settings',
 *           "type": 'bar',
 *           "hidden": true,
 *           "created_time": 1565466371781,
 *           "timestamp": 1565466371781,
 *           "user_id": '5d4f1f0380b17154007ac04c'
 *         },
 *         {
 *           "_id": '5d4f1f0380b17154007ac050',
 *           "title": 'SugarizerChart2_1565466370822',
 *           "key": 'how-users-are-active',
 *           "type": 'pie',
 *           "hidden": false,
 *           "created_time": 1565466371796,
 *           "timestamp": 1565466371796,
 *           "user_id": '5d4f1f0380b17154007ac04c'
 *         }
 *       ]
 *     }
 **/
exports.findAll = function(req, res) {
	//form query
	var query = {
		user_id: new mongo.ObjectID(req.user._id)
	};

	query = addQuery('key', req.query, query);
	query = addQuery("q", req.query, query);
	query = addQuery("hidden", req.query, query);

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
				orderedData = orderedData.filter(function(data) {
					return data != null;
				});
				res.send({charts: orderedData});
			} else {
				res.send({charts: data});
			}
		});
	});
};

/**
 * @api {get} api/v1/charts/:id Get chart detail
 * @apiName GetChart
 * @apiDescription Retrieve detail for a specific chart.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} id Unique chart id
 * 
 * @apiSuccess {String} _id Unique chart id
 * @apiSuccess {String} title Chart title or name
 * @apiSuccess {String} key Key that identifies the chart features
 * @apiSuccess {String} type Type of the chart (timeline, bar, pie, table)
 * @apiSuccess {Boolean} hidden Will the chart be rendered in statistics view
 * @apiSuccess {Number} created_time When the chart was created on the server
 * @apiSuccess {Number} timestamp When the chart last edited on the server
 * @apiSuccess {String} user_id Unique id of the user who created the chart
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": '5d4f1f0380b17154007ac04f',
 *       "title": 'SugarizerChart1_1565466370822',
 *       "key": 'how-often-user-change-settings',
 *       "type": 'bar',
 *       "hidden": true,
 *       "created_time": 1565466371781,
 *       "timestamp": 1565466371781,
 *       "user_id": '5d4f1f0380b17154007ac04c'
 *     }
 **/
exports.findById = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 27
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

/**
 * @api {post} api/v1/charts Add chart
 * @apiName Addchart
 * @apiDescription Add chart in the database. Returns the inserted chart.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiSuccess {String} _id Unique chart id
 * @apiSuccess {String} title Chart title or name
 * @apiSuccess {String} key Key that identifies the chart features
 * @apiSuccess {String} type Type of the chart (timeline, bar, pie, table)
 * @apiSuccess {Boolean} hidden Will the chart be rendered in statistics view
 * @apiSuccess {Number} created_time When the chart was created on the server
 * @apiSuccess {Number} timestamp When the chart last edited on the server
 * @apiSuccess {String} user_id Unique id of the user who created the chart
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": '5d4f2375e1043a5743275a7f',
 *       "title": 'SugarizerChart1_1565467508677',
 *       "key": 'how-often-user-change-settings',
 *       "type": 'bar',
 *       "hidden": true,
 *       "created_time": 1565467509661,
 *       "timestamp": 1565467509661,
 *       "user_id": '5d4f2375e1043a5743275a7c'
 *     }
 **/
exports.addChart = function(req, res) {
	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 28
		});
		return;
	}

	//parse user details
	var chart = req.body.chart;

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
											'code': 25
										});
									}
								}
							});
						});
					} else {
						res.status(401).send({
							error: "Inexisting chart id",
							code: 26
						});
					}
				}
			}
		);
	});
};

/**
 * @api {delete} api/v1/charts/:id  Remove chart
 * @apiName RemoveChart
 * @apiDescription Remove the chart by id.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiParam {String} id Unique id of the chart to delete
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "5d4f2375e1043a5743275a7f"
 *     }
 **/
exports.removeChart = function(req, res) {
	//validate
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 27
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
											'code': 25
										});
									}
								}
							});
						});
					} else {
						res.status(401).send({
							error: "Inexisting chart id",
							code: 26
						});
					}
				}
			}
		);
	});
};

/**
 * @api {put} api/v1/charts/:id Update chart
 * @apiName UpdateChart
 * @apiDescription Update an chart. Return the chart updated.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 *
 * @apiParam {String} id Unique chart id
 * 
 * @apiSuccess {String} _id Unique chart id
 * @apiSuccess {String} title Chart title or name
 * @apiSuccess {String} key Key that identifies the chart features
 * @apiSuccess {String} type Type of the chart (timeline, bar, pie, table)
 * @apiSuccess {Boolean} hidden Will the chart be rendered in statistics view
 * @apiSuccess {Number} created_time When the chart was created on the server
 * @apiSuccess {Number} timestamp When the chart last edited on the server
 * @apiSuccess {String} user_id Unique id of the user who created the chart
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": '5d4f2375e1043a5743275a80',
 *       "title": 'SugarizerChart2_new_1565467508677',
 *       "key": 'how-users-are-active',
 *       "type": 'pie',
 *       "hidden": false,
 *       "created_time": 1565467509677,
 *       "timestamp": 1565467509724,
 *       "user_id": '5d4f2375e1043a5743275a7c'
 *     }
 **/
exports.updateChart = function(req, res) {
	if (!mongo.ObjectID.isValid(req.params.chartid)) {
		res.status(401).send({
			error: "Invalid chart id",
			code: 27
		});
		return;
	}

	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 28
		});
		return;
	}

	var chartid = req.params.chartid;
	var chart = req.body.chart;

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
							code: 26
						});
					}
				}
			}
		);
	});
};

/**
 * @api {put} api/v1/charts/reorder Reorder Charts
 * @apiName ReorderCharts
 * @apiDescription Update the order in which the charts are displayed.
 * @apiGroup Charts
 * @apiVersion 1.2.0
 *
 * @apiHeader {String} x-key User unique id.
 * @apiHeader {String} x-access-token User access token.
 * @apiSuccess {Object[]} charts List of charts ids
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "charts": [
 *     	  '5d4f2375e1043a5743275a80',
 *     	  '5d4f2375e1043a5743275a7f'
 *       ]
 *     }
 **/
exports.reorderChart = function (req, res) {
	//validate
	if (!req.body.chart) {
		res.status(401).send({
			error: "Chart object not defined!",
			code: 28
		});
		return;
	}

	var chart = req.body.chart;

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
						'code': 29
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
		} else if (filter == "hidden") {
			if (params["hidden"] == "false") {
				query["hidden"] = {
					$ne: true
				};
			} else if (params["hidden"] == "true") {
				query["hidden"] = true;
			}
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

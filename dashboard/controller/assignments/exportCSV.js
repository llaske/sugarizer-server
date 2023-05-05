// include libraries
var superagent = require('superagent'),
	async = require('async'),
	common = require('../../helper/common');

module.exports = function exportCSV(req, res) {
	var deliveries = [];
	
	common.reinitLocale(req);
	var query = {
		sort: '+buddy_name'
	};
	
	//get query params
	if (req.query.buddy_name != '') {
		query['buddy_name'] = req.query.buddy_name;
	}
	if (req.query.status != '') {
		query['Delivered'] = req.query.status;
	}
	if (req.query.limit != '') {
		query['limit'] = req.query.limit;
	}
	if (req.query.offset != '') {
		query['offset'] = req.query.offset;
	}
	if (req.query.sort != '') {
		query['sort'] = req.query.sort;
	}

	function validateDelivery(delivery) {
		var validDelivery = {
			_id : "",
			name : "",
			status: "",
			activity : "",
			submissionDate : "",
			comment : ""
		};

		if (delivery._id) {
			validDelivery._id = delivery._id;
		}
		if (delivery.content) {
			if (delivery.content[0].metadata && typeof delivery.content[0].metadata == "object") {
				if(delivery.content[0].metadata.buddy_name) {
					validDelivery.name = delivery.content[0].metadata.buddy_name;
				}
				if(delivery.content[0].metadata.status) {
					validDelivery.status = delivery.content[0].metadata.status;
				}
				if(delivery.content[0].metadata.title) {
					validDelivery.activity = delivery.content[0].metadata.title;
				}
				if(delivery.content[0].metadata.submissionDate) {
					validDelivery.submissionDate = delivery.content[0].metadata.submissionDate;
				}
				if(delivery.content[0].metadata.comment) {
					validDelivery.comment = delivery.content[0].metadata.comment;
				}
			}
		}
		
		return validDelivery;
    }

    async.series([
	    function(callback) {
		    superagent
			    .get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/' + req.params.assignmentId)
			    .set(common.getHeaders(req))
			    .query(query)
			    .end(function (error, response) {
			    if (response.statusCode == 200) {
				    if (response.body.deliveries && response.body.deliveries.length) {
					    var temp = [];
					    for (var i=0; i < response.body.deliveries.length; i++) {
						    temp.push(validateDelivery(response.body.deliveries[i]));
						    if (i == response.body.deliveries.length - 1) {
							    deliveries = deliveries.concat(temp);
							    callback(null);
						    }
					    }
				    } else {
					    callback(null);
				    }
			    } else {
				    callback(null);
			    }
		    });
	    },],
		 function() {
	    if (deliveries.length == 0) {
		    res.json({success: false, msg: common.l10n.get('NoDeliveriesFound')});
	    } else {
		    res.json({success: true, msg: common.l10n.get('ExportSuccessDeliveries'), data: deliveries});
	    }
	    return;
    });
};

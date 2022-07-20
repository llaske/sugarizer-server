/* eslint-disable indent */
var superagent = require('superagent'),
    moment = require('moment'),
    common = require('../../helper/common');

var _util = require('../journal/util'),
    getActivities = _util.getActivities;

// init settings
var ini = null;
exports.init = function (settings) {
    ini = settings;
};
exports.ini = function () {
    return ini;
};
var assignment = require('./index');

module.exports = function getAllDeliveries(req, res) {
    common.reinitLocale(req);
    var query = {
        sort: '+name'
    };

    //get query params
    if (req.query.assignments != '') {
        query['q'] = req.query.assignments;
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

    getActivities(req, res, function (activities) {
        var hashList = {};
        for (var i = 0; i < activities.length; i++) {
            hashList[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
        }

        superagent
            .get(common.getAPIUrl(req) + 'api/v1/assignments/deliveries/' + req.params.assignmentId)
            .set(common.getHeaders(req))
            .query(query)
            .end(function (error, response) {
                if (response.statusCode == 200) {

                    res.render('deliveries', {
                        moment: moment,
                        query: query,
                        module: 'assignments',
                        headers: common.getHeaders(req),
                        server: assignment.ini().information,
                        iconList: hashList,
                        account: req.session.user,
                        data: response.body,
                    });

                } else {
                    res.render('error', {
                        message: response.body.message,
                        error: response.body.error,
                        module: 'assignments',
                        status: response.statusCode,
                        title: 'Error'
                    });
                }
            });

    });
};



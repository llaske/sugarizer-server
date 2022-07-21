/* eslint-disable indent */
var superagent = require('superagent'),
    moment = require('moment'),
    common = require('../../helper/common'),
    addAssignment = require('./addAssignment'),
    deleteAssignment = require('./deleteAssignment'),
    editAssignment = require('./editAssignment'),
    getAllDeliveries = require('./getAllDeliveries'),
    launchAssignment = require('./launchAssignment');


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

//main Loading page
exports.index = function (req, res) {
    console.log(req.session.user.user.role);
    common.reinitLocale(req);
    var query = {
        sort: '+name'
    };

    //get query params
    if (req.query.classroom != '') {
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
            .get(common.getAPIUrl(req) + 'api/v1/assignments')
            .set(common.getHeaders(req))
            .query(query)
            .end(function (error, response) {
                if (response.statusCode == 200) {

                    res.render('assignments', {
                        moment: moment,
                        query: query,
                        module: 'assignments',
                        headers: common.getHeaders(req),
                        server: ini.information,
                        iconList: hashList,
                        account: req.session.user,
                        data: response.body,
                    });
                }
            });
    });
};

exports.addAssignment = addAssignment;
exports.deleteAssignment = deleteAssignment;
exports.editAssignment = editAssignment;
exports.getAllDeliveries = getAllDeliveries;
exports.launchAssignment = launchAssignment;

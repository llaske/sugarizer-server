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

    common.reinitLocale(req);
    var query = {
        sort: '+name'
    };

    //get query params
    if (req.query.assignment != '') {
        query['q'] = req.query.assignment;
    }
    if (req.query.status != '') {
        query['s'] = req.query.status;
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
        var iconMap = {};
        for (var i = 0; i < activities.length; i++) {
            iconMap[activities[i].id] = '/' + activities[i].directory + '/' + activities[i].icon;
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
                        iconMap: iconMap,
                        account: req.session.user,
                        data: response.body,
                    });
                } else {
                    req.flash('errors', {
                        msg: common.l10n.get('ErrorCode' + response.body.code)
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

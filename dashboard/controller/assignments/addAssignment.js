/* eslint-disable indent */
var superagent = require('superagent'),
    moment = require('moment'),
    common = require('../../helper/common'),
    xocolors = require('../../helper/xocolors'),
    emoji = require('../../public/js/emoji'),
    dashboard_utils = require('../dashboard/util'),
    journal_utils = require('../journal/util/index');

var assignment = require('./index');

module.exports = function addAssignment(req, res) {
    // reinit l10n and momemt with locale

    common.reinitLocale(req);
    var query = {
        limit: (req.query.limit ? req.query.limit : 10),
        sort: (req.query.sort ? req.query.sort : '-timestamp'),
        offset: (req.query.offset ? req.query.offset : 0)
    };
    if (req.session.user) {
        query['journal'] = req.session.user.user.private_journal;
    }
    if (req.query.uid) {
        query['uid'] = req.query.uid;
        query['type'] = "private";
    } else {

        query['type'] = "shared";
    }
    console.log(query);


    if (req.method == 'POST') {
        // validate
        console.log({ BODY: req.body });
        req.body.name = req.body.name.trim();
        req.body.classrooms = req.body.classrooms || [];
        if (typeof req.body.classrooms == 'string') {
            req.body.classrooms = [req.body.classrooms];
        }
        // req.body.color = JSON.parse(req.body.color);
        req.assert('name', common.l10n.get('UsernameInvalid')).matches(/^[a-z0-9 ]+$/i);
        req.body.options = { sync: true, stats: true };

        // get errors
        var errors = req.validationErrors();

        // call
        if (!errors) {
            superagent
                .post(common.getAPIUrl(req) + 'api/v1/assignments')
                .set(common.getHeaders(req))
                .send({
                    assignment: JSON.stringify(req.body)
                })
                .end(function (error, response) {
                    if (response.statusCode == 200) {
                        console.log({ "body": response.body });
                        // send to classrooms page
                        req.flash('success', {
                            msg: common.l10n.get('AssignmentCreated', { name: req.body.name })
                        });
                        return res.redirect('/dashboard/assignments/');
                    } else {
                        req.flash('errors', {
                            msg: common.l10n.get('ErrorCode' + response.body.code)
                        });
                        return res.redirect('/dashboard/assignments/add');
                    }
                });
        } else {
            dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
                journal_utils.getJournalEntries(req, res, query, function (journalEntries) {
                    console.log({ "journalEntries": journalEntries });
                    if (req.body.classrooms && typeof (req.body.classrooms) == "object" && req.body.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
                        for (var i = 0; i < classrooms.classrooms.length; i++) {
                            if (req.body.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
                                classrooms.classrooms[i]['is_member'] = true;
                            }
                        }
                    }
                    req.flash('errors', errors);
                    return res.render('addEditAssignment', {
                        mode: "add",
                        module: 'assignments',
                        xocolors: xocolors,
                        emoji: emoji,
                        moment: moment,
                        entries: journalEntries.entries,
                        classrooms: classrooms.classrooms,
                        account: req.session.user,
                        server: assignment.ini().information
                    });
                });
            });
        }

    } else {

        // send back
        dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
            journal_utils.getJournalEntries(req, res, query, function (journalEntries) {
                console.log({ "journalEntries": journalEntries.entries });
                console.log(query);
                res.render('addEditAssignment', {
                    mode: "add",
                    module: 'assignments',
                    classrooms: classrooms.classrooms,
                    xocolors: xocolors,
                    emoji: emoji,
                    entries: journalEntries.entries,
                    moment: moment,
                    account: req.session.user,
                    server: assignment.ini().information
                });
            });
        });

    }
};

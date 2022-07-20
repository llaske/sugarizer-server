/* eslint-disable indent */
//include libraries
var superagent = require('superagent'),
    moment = require('moment'),
    common = require('../../helper/common'),
    xocolors = require('../../helper/xocolors')(),
    emoji = require('../../public/js/emoji'),
    dashboard_utils = require('../dashboard/util');


var assignments = require('./index');

module.exports = function editAssignment(req, res) {

    // reinit l10n and momemt with locale
    common.reinitLocale(req);



    if (req.params.assignmentId) {

        if (req.method == 'POST') {


            // validate
            req.body.name = req.body.name.trim();
            req.body.classrooms = req.body.classrooms || [];


            if (typeof req.body.classrooms == 'string') {
                req.body.classrooms = [req.body.classrooms];
            }
            // req.body.color = JSON.parse(req.body.color);
            req.assert('name', common.l10n.get('UsernameInvalid')).matches(/^[a-z0-9 ]+$/i);

            // get errors
            var errors = req.validationErrors();

            if (!errors) {
                superagent
                    .put(common.getAPIUrl(req) + 'api/v1/assignments/' + req.params.assignmentId)
                    .set(common.getHeaders(req))
                    .send({
                        assignment: JSON.stringify(req.body)
                    })
                    .end(function (error, response) {
                        if (response.statusCode == 200) {

                            // send back
                            req.flash('success', {
                                msg: common.l10n.get('AssignmentUpdated', { name: req.body.name })
                            });
                            return res.redirect('/dashboard/assignments/');
                        } else {

                            req.flash('errors', {
                                msg: common.l10n.get('ErrorCode' + response.body.code)
                            });
                            return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
                        }
                    });
            } else {

                req.flash('errors', errors);
                return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
            }
        } else {

            superagent
                .get(common.getAPIUrl(req) + 'api/v1/assignments/' + req.params.assignmentId)
                .set(common.getHeaders(req))
                .end(function (error, response) {
                    if (response.statusCode == 200) {



                        dashboard_utils.getAllClassrooms(req, res, function (classrooms) {
                            if (assignments.classrooms && typeof (assignments.classrooms) == "object" && assignments.classrooms.length > 0 && classrooms && classrooms.classrooms && classrooms.classrooms.length > 0) {
                                for (var i = 0; i < classrooms.classrooms.length; i++) {
                                    if (assignments.classrooms.indexOf(classrooms.classrooms[i]._id) != -1) {
                                        classrooms.classrooms[i]['is_member'] = true;
                                    }
                                }
                            }

                            // send back
                            res.render('addEditAssignment', {
                                module: 'assignments',
                                name: "Assignments",
                                mode: "edit",
                                assignment: response.body,
                                classrooms: classrooms.classrooms,
                                moment: moment,
                                xocolors: xocolors,
                                emoji: emoji,
                                account: req.session.user,
                                server: assignments.ini().information
                            });
                        });

                    } else {
                        req.flash('errors', {
                            msg: common.l10n.get('ErrorCode' + response.body.code)
                        });
                        return res.redirect('/dashboard/assignments/edit/' + req.params.assignmentId);
                    }
                });
        }
    }
};


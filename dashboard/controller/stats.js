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

  //data var
  var data = []

  // get data
  getLogsData(req, res, {
    event_action: 'launch_activity'
  }, function(body) {
    data = data.concat(body)
    getLogsData(req, res, {
      event_action: 'relaunch_activity'
    }, function(body) {
      data = data.concat(body)

      var d = {}
      for (var i = 0; i < data.length; i++) {
        if (!d.hasOwnProperty(data[i].event_object)) {
          d[data[i].event_object] = 0
        } else {
          d[data[i].event_object]++
        }
      }

      var labels = []
      var ddata = []
      for (var v in d) {
        labels.push(v)
        ddata.push(d[v])
      }

      //return
      return res.json({
        data: {
          labels: labels,
          datasets: [{
            data: ddata,
            backgroundColor: [
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ]
          }]
        },
        element: req.query.element,
        graph: 'pie'
      })
    })
  })
}

function getHowOftenUserChangeSettings(req, res) {

  //data
  var data = {
    labels: [],
    data: []
  }

  // get data
  getLogsData(req, res, {
    event_object: 'my_settings_language'
  }, function(body) {
    data.labels.push('Language Settings')
    data.data.push(body.length)
    getLogsData(req, res, {
      event_object: 'my_settings_about_me'
    }, function(body) {
      data.labels.push('Name/Color Settings')
      data.data.push(body.length)

      //return
      return res.json({
        data: {
          labels: data.labels,
          datasets: [{
            label: '# of times settings changed',
            data: data.data,
            backgroundColor: [
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ]
          }]
        },
        element: req.query.element,
        graph: 'bar'
      })
    })
  })
}


function getLogsData(req, res, query, callback) {
  request({
    headers: common.getHeaders(req),
    json: true,
    method: 'GET',
    qs: query,
    uri: common.getAPIUrl(req) + 'api/v1/stats'
  }, function(error, response, body) {
    if (response.statusCode == 200) {
      callback(body)
    }
  });
}

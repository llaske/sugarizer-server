// include private functions 
var {
    getTopContributors,
    getTopActivities,
    getRecentUsers,
    getRecentActivities
} = require('./util')

exports.getGraph = function(req, res) {
    
    if (req.query.type == 'top-contributor') {
        getTopContributors(req, res);
    }
    if (req.query.type == 'top-activities') {
        getTopActivities(req, res);
    }
    if (req.query.type == 'recent-users') {
        getRecentUsers(req, res);
    }
    if (req.query.type == 'recent-activities') {
        getRecentActivities(req, res);
    }
}

var averageEntries = 0.0;
exports.getAverageEntries = function() {
    return averageEntries;
}

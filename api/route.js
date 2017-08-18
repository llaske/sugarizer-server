//include libraries
var activities = require('./controller/activities'),
  journal = require('./controller/journal'),
  users = require('./controller/users'),
  auth = require('./controller/auth'),
  stats = require('./controller/stats'),
  validate = require('./middleware/validateRequest'),
  presence = require('./middleware/presence');

module.exports = function(app, ini) {

  //Only the requests that start with /api/v1/* will be checked for the token.
  app.all('/api/v1/*', [validate]);

  // Init modules
  activities.load(ini);
  journal.init(ini);
  users.init(ini);
  presence.init(ini);
  stats.init(ini);

  // Routes that can be accessed by any one
  app.post('/auth/login', auth.login);
  app.post('/auth/signup', auth.signup);

  // Register activities list API
  app.get("/api/v1/activities", activities.findAll);
  app.post("/api/v1/activities", activities.updateActivities);
  app.get("/api/v1/activities/:id", activities.findById);

  // Register users API
  app.get("/api/v1/users", users.findAll);
  app.get("/api/v1/users/:uid", users.findById);
  app.post("/api/v1/users", users.addUser);
  app.put("/api/v1/users/:uid", users.updateUser);
  app.delete("/api/v1/users/:uid", users.removeUser);

  // Register stats API
  app.get("/api/v1/stats", stats.findAll);
  app.post("/api/v1/stats", stats.addStats);
  app.delete("/api/v1/stats", stats.deleteStats);

  // Register journal API
  app.get("/api/v1/journal", journal.findAll);
  app.get("/api/v1/journal/:jid", journal.findJournalContent);
  app.post("/api/v1/journal/:jid", journal.addEntryInJournal);
  app.put("/api/v1/journal/:jid", journal.updateEntryInJournal);
  app.delete("/api/v1/journal/:jid", journal.removeInJournal);

  // If no route is matched by now, it must be a 404
  app.use('/api/v1/*', function(req, res, next) {
    return res.status(404).res.json({
      "status": 404,
      "message": "Route Not Found!",
      "url": req.protocol + '://' + req.get('host') + req.originalUrl
    });
  });
};

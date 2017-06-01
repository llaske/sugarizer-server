
var jwt = require('jwt-simple');

exports.login = function(req, res) {

  //parse response
  var user = JSON.parse(req.body.user);
  var username = user.username || '';
  var password = user.password || '';

  // Fire a query to your DB and check if the credentials are valid
  var dbUserObj = exports.validate(username, password);

  if (dbUserObj) {
    // If authentication is success, we will generate a token and dispatch it to the client
    res.json(genToken(dbUserObj));

  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid credentials"
    });
    return;
  }
};

exports.validate = function(username, password) {

  // blank check
  if (username == '' || password == '') {
    return false;
  }

  // spoofing the DB response for simplicity
  var dbUserObj = { // spoofing a userobject from the DB.
    name: 'arvind',
    role: 'admin',
    username: 'arvind@myapp.com'
  };

  return dbUserObj;
};

exports.validateUser = function(username) {
  // spoofing the DB response for simplicity
  var dbUserObj = { // spoofing a userobject from the DB.
    name: 'arvind',
    role: 'admin',
    username: 'arvind@myapp.com'
  };

  return dbUserObj;
};

// private method
function genToken(user) {
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());

  return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

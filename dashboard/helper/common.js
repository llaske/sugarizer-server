

exports.getHeaders = function(req) {

  // headers
  return {
    "content-type": "application/json",
    "x-access-token" :  req.session.user.token,
    "x-key" : req.session.user.user._id,
  }
}

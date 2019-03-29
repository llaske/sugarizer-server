module.exports = function(type) {
  switch (type) {
    case "user":
      return /^[a-z0-9 ]+$/i;
    case "pass":
      return /^[a-zA-X0-9]+$/;
    default:
      return /^[a-z0-9]+$/i;
  }
};

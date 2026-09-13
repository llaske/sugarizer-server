module.exports = function(type) {
	switch (type) {
	case "user":
		//All alphanumeric characters case insensitive, plus spaces and underscores
		return /^[a-z0-9_ ]+$/i;
	case "pass":
		//All alphanumeric characters case insensitive except 'Y' and 'Z'
		return /^[a-zA-X0-9]+$/;
	case "tokenentry":
		return /^[0-9]{1,6}$/;
	default:
		//All alphanumeric characters case insensitive
		return /^[a-z0-9]+$/i;
	}
};

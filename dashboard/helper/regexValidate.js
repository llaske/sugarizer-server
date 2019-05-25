module.exports = function(type) {
	switch (type) {
	case "user":
		//All Alphanumeric characters case insensitive + spaces
		return /^[a-z0-9 ]+$/i;
	case "pass":
		//All alphanumeric characters case insensitive except 'Y' and 'Z'
		return /^[a-zA-X0-9]+$/;
	default:
		//All alphanumeric characters case insensitive
		return /^[a-z0-9]+$/i;
	}
};

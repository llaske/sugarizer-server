var check = require('express-validator').check,
	validationResult = require('express-validator').validationResult;

async function run(req, validators) {
	for (var i = 0; i < validators.length; i++) {
		await validators[i].run(req);
	}
}

function errors(req) {
	var result = validationResult(req);
	if (result.isEmpty()) {
		return false;
	}
	return result.array().map(function(err) {
		return {
			param: err.path,
			msg: err.msg,
			value: err.value
		};
	});
}

module.exports = {
	check: check,
	run: run,
	errors: errors
};

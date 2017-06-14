// Load Sugarizer Settings
var fs = require('fs'),
	ini = require('ini');

// Load and parse sugarizer.ini file
exports.load = function(env) {

	//validate
	if (!env) env = "sugarizer";

	//add directory
	confFile = "./env/" + env + '.ini';

	//return parsed config
	return ini.parse(fs.readFileSync(confFile, 'utf-8'))
};

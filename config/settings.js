// Load Sugarizer Settings
var fs = require('fs'),
	ini = require('ini');

// Load and parse sugarizer.ini file and locales.ini
exports.load = function() {

	//validate
	env = (process.env.NODE_ENV ? process.env.NODE_ENV : 'sugarizer')

	//add directory
	confFile = "./env/" + env + '.ini';

	//parse config
	var settings = ini.parse(fs.readFileSync(confFile, 'utf-8'));

	//parse locales.ini
	settings.locales = ini.parse(fs.readFileSync('./dashboard/public/l10n/locales.ini', 'utf-8'));

	return settings;
};

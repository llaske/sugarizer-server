var classrooms = require('../classrooms');

exports.fetchAllStudents = function (classrm) {
	return new Promise(function(resolve) {
		var students = [];
		if (classrm.length == 0) return resolve(students);
		for (var classCount=0, i=0; i < classrm.length; i++) {
			classrooms.findStudents(classrm[i]).then(function(stds) {
				students = students.concat(stds);
				classCount++;
				if (classCount == classrm.length) return resolve(students);
			}).catch(function() {
				classCount++;
				if (classCount == classrm.length) return resolve(students);
			});
		}
	});
}

exports.createUUID = function() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid
}

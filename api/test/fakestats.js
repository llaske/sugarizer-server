//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var timestamp = +new Date();
var randomInt = require('random-int');

//fake user for testing auth
var fakeUser = {
	'student': '{"name":"Sugarizer' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}'
}

//init server
chai.use(chaiHttp);

describe('Stats', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/auth/signup')
				.send({
					"user": fakeUser.student
				})
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/auth/login')
						.send({
							"user": fakeUser.student
						})
						.end((err, res) => {
							//store user data
							fakeUser.student = res.body;
							done();
						});
				});
		}, 300);
	});

	describe('/POST stats', () => {
		it('it should insert stats', (done) => {

			chai.request(server)
				.post('/api/v1/stats/')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"stats": getLogs(randomInt(25, 100))
				})
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	//delete fake user
	after((done) => {

		chai.request(server)
			.delete('/api/v1/journal/' + fakeUser.student.user.private_journal)
			.set('x-access-token', fakeUser.student.token)
			.set('x-key', fakeUser.student.user._id)
			.query({
				'type': 'full'
			})
			.end((err, res) => {
				res.should.have.status(200);
				chai.request(server)
					.delete('/api/v1/users/' + fakeUser.student.user._id)
					.set('x-access-token', fakeUser.student.token)
					.set('x-key', fakeUser.student.user._id)
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
			});
	});
});

//private function to generate fae logs
function getLogs(num) {

	var logData = [
		["neighbourhood_view", "change_view"],
		["list_view", "change_view"],
		["journal_view", "change_view"],
		["home_view", "click"],
		["home_view", "launch_activity"],
		["home_view", "relaunch_activity"],
		["home_view", "search"],
		["my_settings_about_me", "change"],
		["my_settings_language", "change"],
		["my_settings", "click"],
		["list_view", "make_favorite"],
		["list_view", "remove_favorite"],
		["list_view", "launch_activity"],
		["neighbourhood_view", "join_activity"],
		["journal_view", "search"],
		["journal_view", "make_favorite"],
		["journal_view", "remove_favorite"],
		["journal_view", "relaunch_activity"],
		["journal_view", "copy_to_remote"],
		["journal_view", "copy_to_shared"],
		["journal_view", "erase_activity"],
		["journal_view", "rename_activity"]
	];

	var fakeLogs = [];
	var sampleLog = {
		"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		"user_ip": getRandomIP(0, 255),
		"client_type": "web",
		"event_source": "sugarizer",
		"event_object": "",
		"event_action": "",
		"event_label": "null",
		"event_value": "null"
	}

	//add uid of the user
	sampleLog.user_id = fakeUser.student.user._id;

	//append logs
	for (var i = 0; i < num; i++) {

		//change log data
		var idx = randomInt(0, 21)
		sampleLog.event_object = logData[idx][0]
		sampleLog.event_action = logData[idx][1]

		//change timestamp
		sampleLog.timestamp = +new Date() + (randomInt(1000, 10000) * 1000 * ((-1) ^ (randomInt(0, 9))));

		//push it
		fakeLogs.push(sampleLog);
	}

	//retuen
	return JSON.stringify(fakeLogs);
}

// random ip generator
function getRandomIP(min, max) {
	return randomInt(1, 255).toString() + '.' + randomInt(1, 255).toString() + '.' + randomInt(1, 255).toString() + '.' + randomInt(1, 255).toString();
}

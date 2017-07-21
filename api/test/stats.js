//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var timestamp = +new Date();

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
					"stats": getLogs(10)
				})
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	describe('/GET stats', () => {
		it('it should return all stats for the user', (done) => {

			chai.request(server)
				.get('/api/v1/stats/')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					"uid": fakeUser.student.user._id
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.length.should.be.eql(10);
					done();
				});
		});

		it('it should return fields for the stats', (done) => {

			chai.request(server)
				.get('/api/v1/stats/')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					"uid": fakeUser.student.user._id
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.length; i++) {
						res.body[i].should.have.property('user_id').eql(fakeUser.student.user._id);
						res.body[i].should.have.property('user_agent').not.eql(undefined);
						res.body[i].should.have.property('user_ip').not.eql(undefined);
						res.body[i].should.have.property('client_type').not.eql(undefined);
						res.body[i].should.have.property('referrer').not.eql(undefined);
						res.body[i].should.have.property('event_object').not.eql(undefined);
						res.body[i].should.have.property('event_action').not.eql(undefined);
						res.body[i].should.have.property('event_label').not.eql(undefined);
						res.body[i].should.have.property('event_value').not.eql(undefined);
					}
					done();
				});
		});
	});

	describe('/DELETE stats', () => {
		it('it should delete all stats for the user', (done) => {

			chai.request(server)
				.delete('/api/v1/stats/')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					"uid": fakeUser.student.user._id
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
	var fakeLogs = [];
	var sampleLog = {
		"user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
		"user_ip": "122.34.42.165",
		"client_type": "mobile",
		"referrer": "sugarizer",
		"event_object": "home_view",
		"event_action": "search",
		"event_label": "q=stopwatch",
		"event_value": "null"
	}

	//add uid of the user
	sampleLog.user_id = fakeUser.student.user._id;

	//append logs
	for (var i = 0; i < num; i++) {
		sampleLog.timestamp = +new Date();
		fakeLogs.push(sampleLog);
	}

	//retuen
	return JSON.stringify(fakeLogs);
}

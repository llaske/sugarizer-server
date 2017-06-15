//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

//fake user for testing auth
var fakeUser = {
	'student': '{"name":"Sugarizer","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
	'admin': '{"name":"TarunFake","password":"pokemon","role":"admin"}'
}

//init server
chai.use(chaiHttp);

describe('Journal', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/signup')
				.send({
					"user": fakeUser.admin
				})
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/login')
						.send({
							"user": fakeUser.admin
						})
						.end((err, res) => {
							//store user data
							fakeUser.admin = res.body;
							done();
						});
				});
		}, 300);
	});



	//delete fake user access key
	after((done) => {

		chai.request(server)
			.delete('/api/v1/users/' + fakeUser.admin.user._id)
			.set('x-access-token', fakeUser.admin.token)
			.set('x-key', fakeUser.admin.user.name)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});

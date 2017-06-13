//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

//fake user for testing auth
var testUser;

//init server
chai.use(chaiHttp);

describe('users', function() {

	//create & login user and store access key
	before((done) => {

		var user = {
			"user": '{"name":"TarunFake","password":"pokemon","role":"admin"}'
		};

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/signup')
				.send(user)
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/login')
						.send(user)
						.end((err, res) => {
							//store user data
							testUser = res.body;
							done();
						});
				});
		}, 300);
	});

	// describe('/GET stats', () => {
	// 	it('it should return all the stats', (done) => {
	//
	// 		chai.request(server)
	// 			.get('/api/v1/stats')
	// 			.set('x-access-token', testUser.token)
	// 			.set('x-key', testUser.user.name)
	// 			.end((err, res) => {
	// 				res.should.have.status(200);
	// 				res.body.should.be.a('array');
	// 				res.body.length.should.be.eql(28);
	// 				done();
	// 			});
	// 	});
	// });

	//delete fake user access key
	after((done) => {

		chai.request(server)
			.delete('/api/v1/users/' + testUser.user._id)
			.set('x-access-token', testUser.token)
			.set('x-key', testUser.user.name)
			.end((err, res) => {
				done();
			});
	});
});

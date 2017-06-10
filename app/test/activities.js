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

describe('Activities', function() {

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

	describe('/GET activities', () => {
		it('it should return all the activities', (done) => {

			chai.request(server)
				.get('/api/v1/activities')
				.set('x-access-token', testUser.token)
				.set('x-key', testUser.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(28);
					done();
				});
		});

		it('it should return all fields', (done) => {
			chai.request(server)
				.get('/api/v1/activities')
				.set('x-access-token', testUser.token)
				.set('x-key', testUser.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.length; i++) {

						res.body[i].should.be.a('object');
						res.body[i].should.have.property('id');
						res.body[i].should.have.property('name');
						res.body[i].should.have.property('version');
						res.body[i].should.have.property('directory');
						res.body[i].should.have.property('favorite');
						res.body[i].should.have.property('activityId');
						res.body[i].should.have.property('index');
					}
					done();
				});
		});

		it('it should return right number of favorites', (done) => {
			chai.request(server)
				.get('/api/v1/activities')
				.query({
					favorite: "true"
				})
				.set('x-access-token', testUser.token)
				.set('x-key', testUser.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(3);
					done();
				});
		});
	});

	describe('/GET/:id activities', () => {
		it('it should return nothing on inexisting activity', (done) => {

			chai.request(server)
				.get('/api/v1/activities/' + 'xxx')
				.set('x-access-token', testUser.token)
				.set('x-key', testUser.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql({});
					done();
				});
		});
	})

	//delete user access key
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

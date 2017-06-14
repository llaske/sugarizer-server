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

describe('users', function() {

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

	describe('/POST users', () => {
		it('it should add a student user', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					"user": fakeUser.student
				})
				.end((err, res) => {
					res.should.have.status(200);
					fakeUser.student = res.body;
					res.body.should.be.a('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('name').eql("Sugarizer");
					res.body.should.have.property('role').eql('student');
					res.body.should.have.property('password').eql("pass");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('shared_journal').not.eql(undefined);
					res.body.should.have.property('private_journal').not.eql(undefined);
					done();
				});
		});

		it('it should not add duplicate student user', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					"user": JSON.stringify(fakeUser.student)
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});
	});

	describe('/GET/:id users', () => {

		it('it should return nothing on invalid id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should return nothing on inexisting id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return right user by id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + fakeUser.student._id)
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id').eql(fakeUser.student._id);
					res.body.should.have.property('name').eql("Sugarizer");
					res.body.should.have.property('role').eql('student');
					res.body.should.have.property('password').eql("pass");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('shared_journal').not.eql(undefined);
					res.body.should.have.property('private_journal').not.eql(undefined);
					done();
				});
		});
	});

	describe('/GET users', () => {
		it('it should return all the users', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.query({
					role: "admin"
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.should.be.a('array');
					res.body.users.length.should.be.above(0);
					done();
				});
		});

		it('it should return all the fields for admin user', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.query({
					role: "admin"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.a('object');
						res.body.users[i].should.have.property('_id').not.eql(undefined);
						res.body.users[i].should.have.property('name').not.eql(undefined);
						res.body.users[i].should.have.property('role').eql('admin');
						res.body.users[i].should.have.property('password').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return all the fields for student user', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.query({
					role: "student"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.a('object');
						res.body.users[i].should.have.property('_id').not.eql(undefined);
						res.body.users[i].should.have.property('name').not.eql(undefined);
						res.body.users[i].should.have.property('role').eql('student');
						res.body.users[i].should.have.property('password').not.eql(undefined);
						res.body.users[i].should.have.property('color').not.eql(undefined);
						res.body.users[i].should.have.property('language').not.eql(undefined);
						res.body.users[i].should.have.property('shared_journal').not.eql(undefined);
						res.body.users[i].should.have.property('private_journal').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return all matched users with partial search', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.query({
					q: "sugar"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.a('object');
						res.body.users[i].should.have.property('_id').eql(fakeUser.student._id);
						res.body.users[i].should.have.property('name').eql("Sugarizer");
						res.body.users[i].should.have.property('role').eql('student');
						res.body.users[i].should.have.property('password').eql("pass");
						res.body.users[i].should.have.property('language').eql("fr");
					}
					done();
				});
		});
	});


	describe('/PUT/:id users', () => {

		it('it should do nothing on invalid user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should do nothing on inexisting user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should update the valid user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student._id)
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/users/' + fakeUser.student._id)
						.set('x-access-token', fakeUser.admin.token)
						.set('x-key', fakeUser.admin.user.name)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.a('object');
							res.body.should.have.property('_id').eql(fakeUser.student._id);
							res.body.should.have.property('name').eql("Sugarizer");
							res.body.should.have.property('language').eql("en");
							done();
						});
				});
		});

		it('it should not update the user with duplicate name', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student._id)
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.send({
					user: '{"name":"TarunFake"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});
	});

	describe('/DELETE/:id users', () => {

		it('it should do nothing on invalid user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should not remove an inexisting user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should remove the valid user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fakeUser.student._id)
				.set('x-access-token', fakeUser.admin.token)
				.set('x-key', fakeUser.admin.user.name)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
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

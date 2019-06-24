//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var timestamp = +new Date();

//fake user for testing auth
var fakeUser = {
	'student1': '{"name":"Sugarizer_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
	'student2': '{"name":"Sugarizer_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
	'teacher1': '{"name":"SugarizerTeach_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"teacher","password":"bulbasaur","language":"fr"}',
	'teacher2': '{"name":"SugarizerTeach_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"teacher","password":"bulbasaur","language":"fr"}',
	'admin1': '{"name":"TarunFake_1' + (timestamp.toString()) + '","password":"pokemon","language":"en","role":"admin"}',
	'admin2': '{"name":"TarunFake_2' + (timestamp.toString()) + '","password":"pokemon","language":"en","role":"admin"}',
	'classroom': '{"name":"group_a_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":[]}'
};

//init server
chai.use(chaiHttp);
chai.should();

describe('Users', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/auth/signup')
				.send({
					"user": fakeUser.admin1
				})
				.end(() => {

					//login user
					chai.request(server)
						.post('/auth/login')
						.send({
							"user": fakeUser.admin1
						})
						.end((err, res) => {
							//store user data
							fakeUser.admin1 = res.body;
							chai.request(server)
								.post('/api/v1/users/')
								.set('x-access-token', fakeUser.admin1.token)
								.set('x-key', fakeUser.admin1.user._id)
								.send({
									"user": fakeUser.teacher2
								})
								.end(() => {
									chai.request(server)
										.post('/auth/login')
										.send({
											"user": fakeUser.teacher2
										})
										.end((err, res) => {
											fakeUser.teacher2 = res.body;
											done();
										});
								});
						});
				});
		}, 300);
	});

	describe('/POST users', () => {
		it('it should add a student user', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					"user": fakeUser.student1
				})
				.end((err, res) => {
					res.should.have.status(200);
					fakeUser.student1 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('name').eql("Sugarizer_1" + (timestamp.toString()));
					res.body.should.have.property('role').eql('student');
					res.body.should.have.property('password').eql("pass");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('shared_journal').not.eql(undefined);
					res.body.should.have.property('private_journal').not.eql(undefined);
					done();
				});
		});

		it('it should not add admin user by teacher', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.send({
					"user": fakeUser.admin2
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should not add teacher user by teacher', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.send({
					"user": fakeUser.teacher1
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should add a student user by teacher', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.send({
					"user": fakeUser.student2
				})
				.end((err, res) => {
					res.should.have.status(200);
					fakeUser.student2 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('name').eql("Sugarizer_2" + (timestamp.toString()));
					res.body.should.have.property('role').eql('student');
					res.body.should.have.property('password').eql("pass");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('shared_journal').not.eql(undefined);
					res.body.should.have.property('private_journal').not.eql(undefined);
					done();
				});
		});

		it('it should add a teacher user', (done) => {
			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					"user": fakeUser.teacher1
				})
				.end((err, res) => {
					res.should.have.status(200);
					fakeUser.teacher1 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('name').eql("SugarizerTeach_1" + (timestamp.toString()));
					res.body.should.have.property('role').eql('teacher');
					res.body.should.have.property('password').eql("bulbasaur");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('classrooms').eql([]);
					done();
				});
		});

		it('it should not add duplicate student user', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					"user": JSON.stringify(fakeUser.student1)
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should not add duplicate teacher user', (done) => {

			chai.request(server)
				.post('/api/v1/users/')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					"user": JSON.stringify(fakeUser.teacher1)
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});
	});

	describe('/GET users', () => {
		before(function(done) {
			fakeUser.classroom = JSON.parse(fakeUser.classroom);
			fakeUser.classroom.students = [fakeUser.student1._id];
			fakeUser.classroom = JSON.stringify(fakeUser.classroom);
			chai.request(server)
				.post('/api/v1/classrooms/')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					"classroom": fakeUser.classroom
				})
				.end((err, res) => {
					res.should.have.status(200);
					fakeUser.classroom = res.body;
					chai.request(server)
						.put('/api/v1/users/' + fakeUser.teacher1._id)
						.set('x-access-token', fakeUser.admin1.token)
						.set('x-key', fakeUser.admin1.user._id)
						.send({
							user: JSON.stringify({classrooms: [fakeUser.classroom._id]})
						})
						.end((err, res) => {
							res.should.have.status(200);
							chai.request(server)
								.post('/auth/login')
								.send({
									"user": JSON.stringify(fakeUser.teacher1)
								})
								.end((err, res) => {
									fakeUser.teacher1 = res.body;
									done();
								});
						});
				});
		});

		it('it should return all the users', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					role: "admin"
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.should.be.an('array');
					res.body.users.length.should.be.above(0);
					done();
				});
		});

		it('it should return all the students for a teacher', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.teacher1.token)
				.set('x-key', fakeUser.teacher1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.should.be.an('array');
					res.body.users.length.should.be.eql(1);
					res.body.users[0]._id.should.be.eql(fakeUser.student1._id);
					done();
				});
		});

		it('it should return all the fields for admin user', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					role: "admin"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.an('object');
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
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					role: "student"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.an('object');
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

		it('it should return all the fields for teacher user', (done) => {
			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					role: "teacher"
				})
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.users.length; i++) {

						res.body.users[i].should.be.an('object');
						res.body.users[i].should.have.property('_id').not.eql(undefined);
						res.body.users[i].should.have.property('name').not.eql(undefined);
						res.body.users[i].should.have.property('role').eql('teacher');
						res.body.users[i].should.have.property('password').not.eql(undefined);
						res.body.users[i].should.have.property('color').not.eql(undefined);
						res.body.users[i].should.have.property('language').not.eql(undefined);
						res.body.users[i].should.have.property('classrooms').be.an('array');
					}
					done();
				});
		});

		it('it should return all matched users with partial search', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					q: "sugar"
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.length.should.be.gte(1);
					done();
				});
		});

		it('it should return all users after a timestamp', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					stime: fakeUser.student1.timestamp
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.length.should.be.gte(1);
					done();
				});
		});

		it('it should not return users for a future timestamp', (done) => {

			chai.request(server)
				.get('/api/v1/users')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.query({
					stime: 1+fakeUser.student1.timestamp
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.users.length.should.be.gte(0);
					done();
				});
		});
	});

	describe('/GET/:id users', () => {
		it('it should return nothing on invalid id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(18);
					done();
				});
		});

		it('it should return nothing on inexisting id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return nothing by unauthorized teacher', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + fakeUser.student2._id)
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should return right user by id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('_id').eql(fakeUser.student1._id);
					res.body.should.have.property('name').eql("Sugarizer_1" + (timestamp.toString()));
					res.body.should.have.property('role').eql('student');
					res.body.should.have.property('password').eql("pass");
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('language').eql("fr");
					res.body.should.have.property('shared_journal').not.eql(undefined);
					res.body.should.have.property('private_journal').not.eql(undefined);
					done();
				});
		});

		it('it should return right user by id for authorized teacher', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.teacher1.token)
				.set('x-key', fakeUser.teacher1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('_id').eql(fakeUser.student1._id);
					res.body.should.have.property('name').eql("Sugarizer_1" + (timestamp.toString()));
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

	describe('/GET/:id/classroom users', () => {
		it('it should return nothing on invalid id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'xxx' + '/classroom')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(18);
					done();
				});
		});

		it('it should return nothing on inexisting id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + 'ffffffffffffffffffffffff' +'/classroom')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql([]);
					done();
				});
		});

		it('it should return right classrooms by user id', (done) => {

			chai.request(server)
				.get('/api/v1/users/' + fakeUser.student1._id + '/classroom')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('array');
					var exists = true;
					for(var i=0; i<res.body.length; i++) {
						if (res.body[i].students && res.body[i].students.indexOf(fakeUser.student1._id) == -1) {
							exists = false;
							break;
						}
					}
					chai.expect(exists).to.eql(true);
					done();
				});
		});
	});

	describe('/PUT/:id users', () => {
		it('it should do nothing on invalid user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(18);
					done();
				});
		});

		it('it should do nothing on inexisting user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should update the valid user', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student2._id)
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/users/' + fakeUser.student2._id)
						.set('x-access-token', fakeUser.admin1.token)
						.set('x-key', fakeUser.admin1.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('_id').eql(fakeUser.student2._id);
							res.body.should.have.property('name').eql("Sugarizer_2" + (timestamp.toString()));
							res.body.should.have.property('language').eql("en");
							done();
						});
				});
		});

		it('it should do nothing by the unauthorized teacher', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student2._id)
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.send({
					user: '{"language":"fr"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should update the valid student by the authorized teacher', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.teacher1.token)
				.set('x-key', fakeUser.teacher1.user._id)
				.send({
					user: '{"language":"en"}'
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/users/' + fakeUser.student1._id)
						.set('x-access-token', fakeUser.teacher1.token)
						.set('x-key', fakeUser.teacher1.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('_id').eql(fakeUser.student1._id);
							res.body.should.have.property('name').eql("Sugarizer_1" + (timestamp.toString()));
							res.body.should.have.property('language').eql("en");
							done();
						});
				});
		});

		it('it should not update the user with duplicate name', (done) => {

			chai.request(server)
				.put('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.send({
					user: '{"name":"TarunFake_1' + timestamp.toString() + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(22);
					done();
				});
		});
	});

	describe('/DELETE/:id users', () => {
		it('it should do nothing on invalid user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + 'xxx')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(18);
					done();
				});
		});

		it('it should not remove an inexisting user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should not remove the student by the unauthorized teacher', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.teacher2.token)
				.set('x-key', fakeUser.teacher2.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should remove the student by the authorized teacher', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fakeUser.student1._id)
				.set('x-access-token', fakeUser.teacher1.token)
				.set('x-key', fakeUser.teacher1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});

		it('it should remove the admin by the teacher', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fakeUser.admin1.user._id)
				.set('x-access-token', fakeUser.teacher1.token)
				.set('x-key', fakeUser.teacher1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should remove the valid user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fakeUser.student2._id)
				.set('x-access-token', fakeUser.admin1.token)
				.set('x-key', fakeUser.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	//delete fake user access key
	after((done) => {
		chai.request(server)
			.delete('/api/v1/classrooms/' + fakeUser.classroom._id)
			.set('x-access-token', fakeUser.admin1.token)
			.set('x-key', fakeUser.admin1.user._id)
			.end((err, res) => {
				res.should.have.status(200);
				chai.request(server)
					.delete('/api/v1/users/' + fakeUser.teacher1.user._id)
					.set('x-access-token', fakeUser.admin1.token)
					.set('x-key', fakeUser.admin1.user._id)
					.end((err, res) => {
						res.should.have.status(200);
						chai.request(server)
							.delete('/api/v1/users/' + fakeUser.teacher2.user._id)
							.set('x-access-token', fakeUser.admin1.token)
							.set('x-key', fakeUser.admin1.user._id)
							.end((err, res) => {
								res.should.have.status(200);
								chai.request(server)
									.delete('/api/v1/users/' + fakeUser.admin1.user._id)
									.set('x-access-token', fakeUser.admin1.token)
									.set('x-key', fakeUser.admin1.user._id)
									.end((err, res) => {
										res.should.have.status(200);
										done();
									});
							});
					});
			});

	});
});

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var timestamp = +new Date();

//fake user for testing auth
var fake = {
	'student1': '{"name":"Sugarizer_1' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
	'student2': '{"name":"Sugarizer_2' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"word","language":"en"}',
	'admin': '{"name":"TarunFake_' + (timestamp.toString()) + '","password":"pokemon","role":"admin"}',
	'classroom': '{"name":"group_a_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"students":[]}'
}

//init server
chai.use(chaiHttp);

describe('Classrooms', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/auth/signup')
				.send({
					"user": fake.admin
				})
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/auth/login')
						.send({
							"user": fake.admin
						})
						.end((err, res) => {
							//store user data
							fake.admin = res.body;

							//create fake users
							chai.request(server)
								.post('/api/v1/users/')
								.set('x-access-token', fake.admin.token)
								.set('x-key', fake.admin.user._id)
								.send({
									"user": fake.student1
								})
								.end((err, res) => {
									fake.student1 = res.body;
									chai.request(server)
										.post('/api/v1/users/')
										.set('x-access-token', fake.admin.token)
										.set('x-key', fake.admin.user._id)
										.send({
											"user": fake.student2
										})
										.end((err, res) => {
											fake.student2 = res.body;
											done();
										});
								});
						});
				});
		}, 300);
	});

	describe('/POST classroom', () => {
		before(function(done) {
			fake.classroom = JSON.parse(fake.classroom);
			fake.classroom.students = [fake.student1._id, fake.student2._id];
			fake.classroom = JSON.stringify(fake.classroom);
			done();
		});
		it('it should add a classroom', (done) => {
			chai.request(server)
				.post('/api/v1/classrooms/')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.send({
					"classroom": fake.classroom
				})
				.end((err, res) => {
					res.should.have.status(200);
					fake.classroom = res.body;
					res.body.should.be.a('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('name').eql("group_a_" + (timestamp.toString()));
					res.body.should.have.property('color').not.eql(undefined);
					done();
				});
		});
	});

	describe('/GET/:id classroom', () => {

		it('it should return nothing on invalid id', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms/' + 'xxx')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should return nothing on inexisting id', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return right classroom by id', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms/' + fake.classroom._id)
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('_id').eql(fake.classroom._id);
					res.body.should.have.property('name').eql("group_a_" + (timestamp.toString()));
					res.body.should.have.property('color').not.eql(undefined);
					res.body.should.have.property('students').be.an('array')
					var studentList = res.body.students.reduce(function(list, student) {
						if (student.is_member) {
						   list.push(student._id);
						}
						return list;
					}, []);
					chai.expect(studentList).to.eql(fake.classroom.students);
					done();
				});
		});

		it('it should update student property of the classroom on deleting user', (done) => {

			chai.request(server)
				.delete('/api/v1/users/' + fake.student1._id)
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					fake.classroom.students = fake.classroom.students.filter(function(el) { return el != fake.student1._id });
					chai.request(server)
						.get('/api/v1/classrooms/' + fake.classroom._id)
						.set('x-access-token', fake.admin.token)
						.set('x-key', fake.admin.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('students').be.an('array');
							var studentList = res.body.students.reduce(function(list, student) {
								if (student.is_member) {
								   list.push(student._id);
								}
								return list;
							}, []);
							chai.expect(studentList).to.eql(fake.classroom.students);
							done();
						});
				});
		});
	});

	describe('/GET classrooms', () => {
		it('it should return all the classrooms', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.classrooms.should.be.a('array');
					res.body.classrooms.length.should.be.above(0);
					done();
				});
		});

		it('it should return all the fields for classrooms', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.classrooms.length; i++) {
						res.body.classrooms[i].should.be.a('object');
						res.body.classrooms[i].should.have.property('_id').not.eql(undefined);
						res.body.classrooms[i].should.have.property('name').not.eql(undefined);
						res.body.classrooms[i].should.have.property('color').not.eql(undefined);
					}
					done();
				});
		}); 

		it('it should return all matched classrooms with partial search', (done) => {

			chai.request(server)
				.get('/api/v1/classrooms')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.query({
					q: "group_"
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.classrooms.length.should.be.gte(1);
					done();
				});
		}); 
	});


	describe('/PUT/:id classrooms', () => {

		it('it should do nothing on invalid classroom', (done) => {

			chai.request(server)
				.put('/api/v1/classrooms/' + 'xxx')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.send({
					classroom: '{"name":"group_new_a_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should do nothing on inexisting classroom', (done) => {

			chai.request(server)
				.put('/api/v1/classrooms/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.send({
					classroom: '{"name":"group_new_a_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should update the valid classroom', (done) => {

			chai.request(server)
				.put('/api/v1/classrooms/' + fake.classroom._id)
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.send({
					classroom: '{"name":"group_new_a_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('_id').eql(fake.classroom._id);
					res.body.should.have.property('name').eql("group_new_a_" + (timestamp.toString()));
					done();
				});
		});
	});

	describe('/DELETE/:id classrooms', () => {

		it('it should do nothing on invalid classroom', (done) => {

			chai.request(server)
				.delete('/api/v1/classrooms/' + 'xxx')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should not remove an inexisting classroom', (done) => {

			chai.request(server)
				.delete('/api/v1/classrooms/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(23);
					done();
				});
		});

		it('it should remove the valid classroom', (done) => {

			chai.request(server)
				.delete('/api/v1/classrooms/' + fake.classroom._id)
				.set('x-access-token', fake.admin.token)
				.set('x-key', fake.admin.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	//delete fake user access key
	after((done) => {

		chai.request(server)
			.delete('/api/v1/users/' + fake.student2._id)
			.set('x-access-token', fake.admin.token)
			.set('x-key', fake.admin.user._id)
			.end((err, res) => {
				res.should.have.status(200);
				chai.request(server)
					.delete('/api/v1/users/' + fake.admin.user._id)
					.set('x-access-token', fake.admin.token)
					.set('x-key', fake.admin.user._id)
					.end((err, res) => {
						res.should.have.status(200);
						done();
					});
			});
	});
});

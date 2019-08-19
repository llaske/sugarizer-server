//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var timestamp = +new Date();

//fake user for testing auth
var fake = {
	'admin1': '{"name":"TarunFake1_' + (timestamp.toString()) + '","password":"pokemon","language":"en","role":"admin"}',
	'admin2': '{"name":"TarunFake2_' + (timestamp.toString()) + '","password":"pokemon","language":"en","role":"admin"}',
	'teacher': '{"name":"SugarizerTeach_' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"teacher","password":"bulbasaur","language":"fr"}',
	'chart1': '{"title":"SugarizerChart1_' + (timestamp.toString()) + '","key":"how-often-user-change-settings","type":"bar","hidden":true}',
	'chart2': '{"title":"SugarizerChart2_' + (timestamp.toString()) + '","key":"how-users-are-active","type":"pie","hidden":false}',
	'chart3': '{"title":"SugarizerChart3_' + (timestamp.toString()) + '","key":"what-type-of-client-connected","type":"pie","hidden":false}'
};

//init server
chai.use(chaiHttp);
chai.should();

describe('Charts', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/auth/signup')
				.send({
					"user": fake.admin1
				})
				.end(() => {

					//login user
					chai.request(server)
						.post('/auth/login')
						.send({
							"user": fake.admin1
						})
						.end((err, res) => {
							//store user data
							fake.admin1 = res.body;

							//create fake users
							chai.request(server)
								.post('/api/v1/users/')
								.set('x-access-token', fake.admin1.token)
								.set('x-key', fake.admin1.user._id)
								.send({
									"user": fake.admin2
								})
								.end(() => {
									chai.request(server)
										.post('/auth/login')
										.send({
											"user": fake.admin2
										})
										.end((err, res) => {
											fake.admin2 = res.body;
											chai.request(server)
												.post('/api/v1/users/')
												.set('x-access-token', fake.admin1.token)
												.set('x-key', fake.admin1.user._id)
												.send({
													"user": fake.teacher
												})
												.end(() => {
													chai.request(server)
														.post('/auth/login')
														.send({
															"user": fake.teacher
														})
														.end((err, res) => {
															fake.teacher = res.body;
															done();
														});
												});
										});
								});
						});
				});
		}, 300);
	});

	describe('/POST charts', () => {

		it('it should add a chart for admin user', (done) => {

			chai.request(server)
				.post('/api/v1/charts/')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					"chart": fake.chart1
				})
				.end((err, res) => {
					res.should.have.status(200);
					fake.chart1 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('title').eql("SugarizerChart1_" + (timestamp.toString()));
					res.body.should.have.property('key').eql("how-often-user-change-settings");
					res.body.should.have.property('type').eql("bar");
					res.body.should.have.property('hidden').eql(true);
					chai.request(server)
						.get('/api/v1/users/' + fake.admin1.user._id)
						.set('x-access-token', fake.admin1.token)
						.set('x-key', fake.admin1.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('charts').be.an('array');
							res.body.charts.should.eql([fake.chart1._id]);
							done();
						});
				});
		});
        
		it('it should not add a chart for teacher user', (done) => {

			chai.request(server)
				.post('/api/v1/charts/')
				.set('x-access-token', fake.teacher.token)
				.set('x-key', fake.teacher.user._id)
				.send({
					"chart": fake.chart2
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});
        
		it('it should add another chart for admin user', (done) => {

			chai.request(server)
				.post('/api/v1/charts/')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					"chart": fake.chart2
				})
				.end((err, res) => {
					res.should.have.status(200);
					fake.chart2 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('title').eql("SugarizerChart2_" + (timestamp.toString()));
					res.body.should.have.property('key').eql("how-users-are-active");
					res.body.should.have.property('type').eql("pie");
					res.body.should.have.property('hidden').eql(false);
                    
					chai.request(server)
						.get('/api/v1/users/' + fake.admin1.user._id)
						.set('x-access-token', fake.admin1.token)
						.set('x-key', fake.admin1.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('charts').be.an('array');
							res.body.charts.should.eql([fake.chart1._id, fake.chart2._id]);
							done();
						});
				});
		});

		after(function(done) {
			
			chai.request(server)
				.post('/api/v1/charts/')
				.set('x-access-token', fake.admin2.token)
				.set('x-key', fake.admin2.user._id)
				.send({
					"chart": fake.chart3
				})
				.end((err, res) => {
					res.should.have.status(200);
					fake.chart3 = res.body;
					res.body.should.be.an('object');
					res.body.should.have.property('_id').not.eql(undefined);
					res.body.should.have.property('title').eql("SugarizerChart3_" + (timestamp.toString()));
					res.body.should.have.property('key').eql("what-type-of-client-connected");
					res.body.should.have.property('type').eql("pie");
					res.body.should.have.property('hidden').eql(false);
					done();
				});
		});
	});

	describe('/GET charts', () => {

		it('it should return all the charts', (done) => {

			chai.request(server)
				.get('/api/v1/charts')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.charts.should.be.an('array');
					res.body.charts.length.should.be.above(0);
					done();
				});
		});

		it('it should return nothing for teacher', (done) => {

			chai.request(server)
				.get('/api/v1/charts')
				.set('x-access-token', fake.teacher.token)
				.set('x-key', fake.teacher.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should return all the fields for charts', (done) => {

			chai.request(server)
				.get('/api/v1/charts')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.charts.length; i++) {
						res.body.charts[i].should.be.an('object');
						res.body.charts[i].should.have.property('_id').not.eql(undefined);
						res.body.charts[i].should.have.property('title').not.eql(undefined);
						res.body.charts[i].should.have.property('key').not.eql(undefined);
						res.body.charts[i].should.have.property('user_id').not.eql(undefined);
						res.body.charts[i].should.have.property('hidden').not.eql(undefined);
					}
					done();
				});
		}); 

		it('it should return all matched charts with partial search', (done) => {

			chai.request(server)
				.get('/api/v1/charts')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.query({
					q: "SugarizerChart2_"
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.charts.length.should.eql(1);
					done();
				});
		}); 
	});

	describe('/PUT/reorder charts', () => {

		it('it should not update the chart for unauthorized user', (done) => {

			chai.request(server)
				.put('/api/v1/charts/reorder')
				.set('x-access-token', fake.teacher.token)
				.set('x-key', fake.teacher.user._id)
				.send({
					chart: JSON.stringify({list: [fake.chart2._id, fake.chart1._id]})
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});

		it('it should update the valid chart', (done) => {

			chai.request(server)
				.put('/api/v1/charts/reorder')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					chart: JSON.stringify({list: [fake.chart2._id, fake.chart1._id]})
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('charts').be.an('array');
					res.body.charts.should.eql([fake.chart2._id, fake.chart1._id]);
					done();
				});
		});	
	});

	describe('/PUT/:id charts', () => {

		it('it should do nothing on invalid chart', (done) => {

			chai.request(server)
				.put('/api/v1/charts/' + 'xxx')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					chart: '{"title":"SugarizerChart2_new_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(27);
					done();
				});
		});

		it('it should do nothing on inexisting chart', (done) => {

			chai.request(server)
				.put('/api/v1/charts/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					chart: '{"title":"SugarizerChart2_new_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(26);
					done();
				});
		});

		it('it should update the valid chart', (done) => {

			chai.request(server)
				.put('/api/v1/charts/' + fake.chart2._id)
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.send({
					chart: '{"title":"SugarizerChart2_new_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('_id').eql(fake.chart2._id);
					res.body.should.have.property('title').eql("SugarizerChart2_new_" + (timestamp.toString()));
					done();
				});
		});

		it('it should not update the chart for unauthorized user', (done) => {

			chai.request(server)
				.put('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.admin2.token)
				.set('x-key', fake.admin2.user._id)
				.send({
					chart: '{"title":"SugarizerChart1_new_' + (timestamp.toString()) + '"}'
				})
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(26);
					done();
				});
		});

	});
    
	describe('/GET/:id chart', () => {

		it('it should return nothing on invalid id', (done) => {

			chai.request(server)
				.get('/api/v1/charts/' + 'xxx')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(27);
					done();
				});
		});

		it('it should return nothing on inexisting id', (done) => {

			chai.request(server)
				.get('/api/v1/charts/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return nothing for unauthorized teacher user', (done) => {

			chai.request(server)
				.get('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.teacher.token)
				.set('x-key', fake.teacher.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});
        
		it('it should return nothing for unauthorized admin user', (done) => {

			chai.request(server)
				.get('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.admin2.token)
				.set('x-key', fake.admin2.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return right chart by id for authorized user', (done) => {

			chai.request(server)
				.get('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('_id').eql(fake.chart1._id);
					res.body.should.have.property('title').eql("SugarizerChart1_" + (timestamp.toString()));
					res.body.should.have.property('key').eql("how-often-user-change-settings");
					res.body.should.have.property('type').eql("bar");
					res.body.should.have.property('hidden').eql(true);
					done();
				});
		});
	});

	describe('/DELETE/:id charts', () => {

		it('it should do nothing on invalid chart', (done) => {

			chai.request(server)
				.delete('/api/v1/charts/' + 'xxx')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(27);
					done();
				});
		});

		it('it should not remove an inexisting chart', (done) => {

			chai.request(server)
				.delete('/api/v1/charts/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(26);
					done();
				});
		});

		it('it should do nothing for teacher', (done) => {

			chai.request(server)
				.delete('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.teacher.token)
				.set('x-key', fake.teacher.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.code.should.be.eql(19);
					done();
				});
		});
        
		it('it should remove the chart chart from user chart list on deleting valid chart', (done) => {
			chai.request(server)
				.delete('/api/v1/charts/' + fake.chart1._id)
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/users/' + fake.admin1.user._id)
						.set('x-access-token', fake.admin1.token)
						.set('x-key', fake.admin1.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.should.be.an('object');
							res.body.should.have.property('charts').be.an('array');
							res.body.charts.should.eql([fake.chart2._id]);
							done();
						});
				});
		});

		it('it should remove the valid chart', (done) => {

			chai.request(server)
				.delete('/api/v1/charts/' + fake.chart2._id)
				.set('x-access-token', fake.admin1.token)
				.set('x-key', fake.admin1.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
        

	});

	//delete fake user access key
	after((done) => {
		chai.request(server)
			.delete('/api/v1/users/' + fake.teacher.user._id)
			.set('x-access-token', fake.admin1.token)
			.set('x-key', fake.admin1.user._id)
			.end((err, res) => {
				res.should.have.status(200);
				chai.request(server)
					.delete('/api/v1/users/' + fake.admin2.user._id)
					.set('x-access-token', fake.admin1.token)
					.set('x-key', fake.admin1.user._id)
					.end((err, res) => {
						res.should.have.status(200);
						chai.request(server)
							.delete('/api/v1/users/' + fake.admin1.user._id)
							.set('x-access-token', fake.admin1.token)
							.set('x-key', fake.admin1.user._id)
							.end((err, res) => {
								res.should.have.status(200);
								done();
							});
					});
			});
	});
});

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../api.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var timestamp = +new Date();

//fake user for testing auth
var fakeUser = {
	"user": '{"name":"TarunFake' + (timestamp.toString()) + '","password":"pokemon","role":"admin"}'
};

//init server
chai.use(chaiHttp);

describe('Activities', function() {

	//create & login user and store access key
	before((done) => {

		//delay for db connection for establish
		setTimeout(function() {
			chai.request(server)
				.post('/signup')
				.send(fakeUser)
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/login')
						.send(fakeUser)
						.end((err, res) => {
							//store user data
							fakeUser = res.body;
							done();
						});
				});
		}, 300);
	});

	describe('/GET activities', () => {
		it('it should return all the activities', (done) => {

			chai.request(server)
				.get('/api/v1/activities')
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.gt(10);
					done();
				});
		});

		it('it should return all fields', (done) => {
			chai.request(server)
				.get('/api/v1/activities')
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.length; i++) {

						res.body[i].should.be.a('object');
						res.body[i].should.have.property('id').not.eql(undefined);
						res.body[i].should.have.property('name').not.eql(undefined);
						res.body[i].should.have.property('version').not.eql(undefined);
						res.body[i].should.have.property('directory').not.eql(undefined);
						res.body[i].should.have.property('favorite').not.eql(undefined);
						res.body[i].should.have.property('activityId').eql(null);
						res.body[i].should.have.property('index').not.eql(undefined);
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
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(3);
					done();
				});
		});

		it('it should return all activities in descending order of "name" with fields [id,name]', (done) => {
			chai.request(server)
				.get('/api/v1/activities')
				.query({
					sort: "-name",
					fields: 'id,name'
				})
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					for (var i = 0; i < res.body.length - 1; i++) {
						if (res.body[i].name < res.body[i + 1].name > 0) {
							throw new Error("Not in descending order");
						}
					}
					done();
				});
		});

		it('it should return right activity with name "Paint" and fields [id,name]', (done) => {
			chai.request(server)
				.get('/api/v1/activities')
				.query({
					name: "labyrinth",
					fields: 'id,name'
				})
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body[0].should.have.property('id').eql('org.olpc-france.labyrinthjs');
					res.body[0].should.have.property('name').not.eql(undefined);
					res.body[0].should.not.have.property('version');
					res.body[0].should.not.have.property('directory');
					res.body[0].should.not.have.property('favorite');
					res.body[0].should.not.have.property('activityId');
					res.body[0].should.not.have.property('index');
					done();
				});
		});
	});

	describe('/GET/:id activities', () => {
		it('it should return nothing on inexisting activity', (done) => {

			chai.request(server)
				.get('/api/v1/activities/' + 'xxx')
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql({});
					done();
				});
		});

		it('it should return right activity on existing id', (done) => {

			chai.request(server)
				.get('/api/v1/activities/' + 'org.olpcfrance.PaintActivity')
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('id').eql('org.olpcfrance.PaintActivity');;
					res.body.should.have.property('name').not.eql(undefined);
					res.body.should.have.property('version').not.eql(undefined);
					res.body.should.have.property('directory').not.eql(undefined);
					res.body.should.have.property('favorite').not.eql(undefined);
					res.body.should.have.property('activityId').eql(null);
					res.body.should.have.property('index').not.eql(undefined);
					done();
				});
		});

		it('it should return right activity with fields [id,name]', (done) => {

			chai.request(server)
				.get('/api/v1/activities/' + 'org.olpcfrance.PaintActivity')
				.query({
					fields: 'id,name'
				})
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property('id').eql('org.olpcfrance.PaintActivity');;
					res.body.should.have.property('name').not.eql(undefined);
					res.body.should.not.have.property('version');
					res.body.should.not.have.property('directory');
					res.body.should.not.have.property('favorite');
					res.body.should.not.have.property('activityId');
					res.body.should.not.have.property('index');
					done();
				});
		});
	})

	describe('/PUT activities', () => {
		it('it should update favorites and order property of activities', (done) => {
			chai.request(server)
				.post('/api/v1/activities')
				.send({
					favorites: 'org.olpcfrance.Abecedarium,org.sugarlabs.MazeWebActivity,org.olpcfrance.PaintActivity'
				})
				.set('x-access-token', fakeUser.token)
				.set('x-key', fakeUser.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body[0].should.have.property('id').eql('org.olpcfrance.Abecedarium');
					res.body[0].should.have.property('favorite').eql(true);
					res.body[1].should.have.property('id').eql('org.sugarlabs.MazeWebActivity');
					res.body[1].should.have.property('favorite').eql(true);
					res.body[2].should.have.property('id').eql('org.olpcfrance.PaintActivity');
					res.body[2].should.have.property('favorite').eql(true);
					done();
				});
		});
	});

	//delete fake user access key
	after((done) => {

		chai.request(server)
			.delete('/api/v1/users/' + fakeUser.user._id)
			.set('x-access-token', fakeUser.token)
			.set('x-key', fakeUser.user._id)
			.end((err, res) => {
				res.should.have.status(200);
				done();
			});
	});
});

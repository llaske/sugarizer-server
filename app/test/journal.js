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

//fake jornal entry
var fakeJournalEntry = {
	'one': '{"objectId":"ffffffff-ffff-ffff-ffff-ffffffffffff","name":"Entry1","value":"#0000FF","metadata":{"timestamp":9990, "activity": "1.mocha.org"}}',
	'two': '{"objectId":"fffffffe-ffff-ffff-ffff-ffffffffffff","name":"Entry2","value":"#00FF00","metadata":{"timestamp":9999, "activity": "2.mocha.org"}}'
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
					"user": fakeUser.student
				})
				.end((err, res) => {

					//login user
					chai.request(server)
						.post('/login')
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

	describe('/GET shared', function() {
		it('it should return the shared journal id', (done) => {
			chai.request(server)
				.get('/api/v1/journal')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'type': 'shared'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.length.should.be.gt(0);
					for (var i = 0; i < res.body.length; i++) {
						res.body[i].should.have.property('_id').not.eql(undefined);
						res.body[i].should.have.property('shared').eql(true);
					}
					done();
				});
		});

		it('it should return the all the private journals id', (done) => {
			chai.request(server)
				.get('/api/v1/journal')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'type': 'private'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.length.should.be.gt(1);
					for (var i = 0; i < res.body.length; i++) {
						res.body[i].should.have.property('_id').not.eql(undefined);
						res.body[i].should.have.property('shared').eql(false);
					}
					done();
				});
		});
	});

	describe('/POST/:id journal', function() {
		it('it should do nothing on invalid journal', (done) => {

			chai.request(server)
				.post('/api/v1/journal/' + 'xxx')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": fakeJournalEntry.one
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should do nothing on inexisting journal', (done) => {

			chai.request(server)
				.post('/api/v1/journal/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": fakeJournalEntry.one
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should add entry in the journal (1/2)', (done) => {

			chai.request(server)
				.post('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": fakeJournalEntry.one
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.$push.content.should.be.deep.equal(JSON.parse(fakeJournalEntry.one));
					done();
				});
		});

		it('it should add another entry in the journal (2/2)', (done) => {

			chai.request(server)
				.post('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": fakeJournalEntry.two
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.$push.content.should.be.deep.equal(JSON.parse(fakeJournalEntry.two));
					done();
				});
		});
	});

	//delete fake user access key
	after((done) => {

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

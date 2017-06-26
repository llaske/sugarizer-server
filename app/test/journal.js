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
	'student': '{"name":"Sugarizer' + (timestamp.toString()) + '","color":{"stroke":"#FF0000","fill":"#0000FF"},"role":"student","password":"pass","language":"fr"}',
	'admin': '{"name":"TarunFake' + (timestamp.toString()) + '","password":"pokemon","role":"admin"}'
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
					res.body.length.should.be.eql(1);
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
					res.body.length.should.be.eql(1);
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
					"journal": genFakeJournalEntry(1)
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
					"journal": genFakeJournalEntry(1)
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should add entry in the journal (1/2)', (done) => {
			var entry = genFakeJournalEntry(1);
			chai.request(server)
				.post('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": entry
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.$push.content.should.be.deep.equal(JSON.parse(entry));
					done();
				});
		});

		it('it should add another entry in the journal (2/2)', (done) => {
			var entry = genFakeJournalEntry(2);
			chai.request(server)
				.post('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.send({
					"journal": entry
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.$push.content.should.be.deep.equal(JSON.parse(entry));
					done();
				});
		});
	});

	describe('/GET/:id journal', function() {
		it('it should do nothing on invalid journal', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + 'xxx')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should do nothing on inexisting journal', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should return all entries on existing journal with no filter', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(2);
					for (var i = 0; i < res.body.entries.length; i++) {
						res.body.entries[i].should.have.property('metadata').not.eql(undefined);
						res.body.entries[i].should.have.property('objectId').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return all entries with fields[text,metadata]', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'fields': 'text,metadata'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(2);
					for (var i = 0; i < res.body.entries.length; i++) {
						res.body.entries[i].should.have.property('text').not.eql(undefined);
						res.body.entries[i].should.have.property('metadata').not.eql(undefined);
						res.body.entries[i].should.have.property('objectId').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return all entries with even with inexisting fields', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'fields': 'text1,metadata1'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(2);
					for (var i = 0; i < res.body.entries.length; i++) {
						res.body.entries[i].should.have.property('objectId').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return nothing when filtered on inexisting activity id', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'aid': '3.mocha.org'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(0);
					done();
				});
		});

		it('it should return filtered entries with fields[text,metadata] and filter on activity id', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'fields': 'text,metadata',
					'aid': '1.mocha.org'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(1);
					for (var i = 0; i < res.body.entries.length; i++) {
						res.body.entries[i].should.have.property('text').not.eql(undefined);
						res.body.entries[i].should.have.property('metadata').not.eql(undefined);
						res.body.entries[i].should.have.property('objectId').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return nothing when filtered on inexisting object id', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'fields': 'text,metadata',
					'oid': 'fffffffe-ffff-ffff-ffff-ffffffffffaf'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(0);
					done();
				});
		});

		it('it should return filtered entries with fields[text,metadata] on object id', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'fields': 'text,metadata',
					'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(1);
					for (var i = 0; i < res.body.entries.length; i++) {
						res.body.entries[i].should.have.property('text').not.eql(undefined);
						res.body.entries[i].should.have.property('metadata').not.eql(undefined);
						res.body.entries[i].should.have.property('objectId').not.eql(undefined);
					}
					done();
				});
		});

		it('it should return all entries when filtered on user id', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'uid': fakeUser.student.user._id
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(2);
					done();
				});
		});

		it('it should return all entries sorted on timestamp(desc)', (done) => {
			chai.request(server)
				.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'sort': '-timestamp'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.entries.length.should.be.eql(2);
					for (var i = 0; i < res.body.entries.length - 1; i++) {
						if (parseInt(res.body.entries[i].metadata.timestamp) < parseInt(res.body.entries[i + 1].metadata.timestamp) > 0) {
							throw new Error("Not in descending order");
						}
					}
					done();
				});
		});
	});

	describe('/PUT/:id journal', function() {
		it('it should update nothing on invalid journal id', (done) => {
			chai.request(server)
				.put('/api/v1/journal/' + 'xxx')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
				})
				.send({
					'journal': genFakeJournalEntry(1, '_updated')
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should update nothing on invalid journal id', (done) => {
			chai.request(server)
				.put('/api/v1/journal/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
				})
				.send({
					'journal': genFakeJournalEntry(1, '_updated')
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should update existing entry with valid journal id', (done) => {
			chai.request(server)
				.put('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
				})
				.send({
					'journal': genFakeJournalEntry(1, '_updated')
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
						.set('x-access-token', fakeUser.student.token)
						.set('x-key', fakeUser.student.user._id)
						.query({
							'fields': 'text',
							'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
						})
						.end((err, res) => {
							res.should.have.status(200);
							res.body.entries.length.should.be.eql(1);
							res.body.entries[0].text.should.be.eql('Entry_1_updated');
							done();
						});
				});
		});

		it('it should update an entry in journal with valid id', (done) => {
			chai.request(server)
				.put('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff5'
				})
				.send({
					'journal': genFakeJournalEntry(5, '_updated')
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
						.set('x-access-token', fakeUser.student.token)
						.set('x-key', fakeUser.student.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.entries.length.should.be.eql(3);
							done();
						});
				});
		});
	});

	describe('/DELETE/:id journal', function() {
		it('it should delete nothing on invalid id', (done) => {
			chai.request(server)
				.delete('/api/v1/journal/' + 'xxx')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'type': 'full'
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should delete nothing on inexisting id', (done) => {
			chai.request(server)
				.delete('/api/v1/journal/' + 'ffffffffffffffffffffffff')
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'type': 'full'
				})
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});

		it('it should not delete the entry with valid journal id and invalid oid', (done) => {
			chai.request(server)
				.delete('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': "ffffffff-ffff-ffff-ffff-fffffffffff9",
					'type': 'partial'
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
						.set('x-access-token', fakeUser.student.token)
						.set('x-key', fakeUser.student.user._id)
						.query({
							'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
						})
						.end((err, res) => {
							res.should.have.status(200);
							res.body.entries.length.should.be.eql(1);
							done();
						});
				});
		});

		it('it should delete the entry with valid journal id and oid', (done) => {
			chai.request(server)
				.delete('/api/v1/journal/' + fakeUser.student.user.private_journal)
				.set('x-access-token', fakeUser.student.token)
				.set('x-key', fakeUser.student.user._id)
				.query({
					'oid': "ffffffff-ffff-ffff-ffff-fffffffffff1",
					'type': 'partial'
				})
				.end((err, res) => {
					res.should.have.status(200);
					chai.request(server)
						.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
						.set('x-access-token', fakeUser.student.token)
						.set('x-key', fakeUser.student.user._id)
						.query({
							'oid': 'ffffffff-ffff-ffff-ffff-fffffffffff1'
						})
						.end((err, res) => {
							res.should.have.status(200);
							res.body.entries.length.should.be.eql(0);
							done();
						});
				});
		});

		it('it should delete the journal with valid id', (done) => {
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
						.get('/api/v1/journal/' + fakeUser.student.user.private_journal)
						.set('x-access-token', fakeUser.student.token)
						.set('x-key', fakeUser.student.user._id)
						.end((err, res) => {
							res.should.have.status(200);
							res.body.entries.length.should.be.eql(0);
							done();
						});
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


//gen fake entries
function genFakeJournalEntry(i, text) {
	return JSON.stringify({
		"objectId": ("ffffffff-ffff-ffff-ffff-fffffffffff" + i.toString()),
		"text": ("Entry_" + i.toString() + (text ? text : '')),
		"metadata": {
			'user_id': fakeUser.student.user._id,
			"timestamp": (+new Date() - parseInt(1000 * Math.random())),
			"activity": (i.toString() + ".mocha.org")
		}
	})
}

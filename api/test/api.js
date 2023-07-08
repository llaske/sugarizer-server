//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var server = require('../../sugarizer.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');

//init server
chai.use(chaiHttp);
chai.should();

var currentVersion = '';

describe('API', function() {

	//load package.json
	before((done) => {
		var info = JSON.parse(fs.readFileSync("./package.json", 'utf-8'));
		currentVersion = info.version;
		done();
	});

	describe('/GET api', () => {
		it('it should return API informations', (done) => {

			chai.request(server)
				.get('/api')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.an('object');
					res.body.should.have.property('name').eql("Sugarizer Server");
					res.body.should.have.property('description').eql("Test Sugarizer Server");
					res.body.should.have.property('web').eql("8080");
					res.body.should.have.property('presence').eql("8039");
					res.body.should.have.property('secure').eql(false);
					res.body.should.have.property('version').eql(currentVersion);
					res.body.should.have.property('options').should.be.an('object');
					var options = res.body.options;
					options.should.have.property('min-password-size').eql('4');
					options.should.have.property('statistics').eql(true);
					options.should.have.property('cookie-age').eql('172800000');
					options.should.have.property('consent-need').eql(false);
					options.should.have.property('policy-url').eql('https://sugarizer.org/policy.html');
					done();
				});
		});
	});
});
